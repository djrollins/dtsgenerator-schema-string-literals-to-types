import { ts, Plugin, PluginContext } from "dtsgenerator";

import packageJson from "./package.json";

const printer = ts.createPrinter();

const plugin: Plugin = {
  meta: {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
  },
  postProcess,
};

type TsType = ts.TypeAliasDeclaration | ts.InterfaceDeclaration;

const createSchemaTypeMappings = (
  types: TsType[]
) => {
  const exportModifier = ts.factory.createToken(ts.SyntaxKind.ExportKeyword);

  const names = types.map((type) => type.name.text);

  const properties = names.map((name) =>
    ts.factory.createPropertySignature(
      [],
      name,
      undefined,
      ts.factory.createTypeReferenceNode(name)
    )
  );

  const objectLiteralType = ts.factory.createTypeLiteralNode(properties);

  const typeMap = ts.factory.createTypeAliasDeclaration(
    undefined,
    [],
    "TypeBySchemaName",
    [],
    objectLiteralType
  );

  const typeMapReference = ts.factory.createTypeReferenceNode("TypeBySchemaName");

  const schemaNameUnion = ts.factory.createTypeOperatorNode(ts.SyntaxKind.KeyOfKeyword, typeMapReference)
  const schemaNameUnionDecl = ts.factory.createTypeAliasDeclaration([], [exportModifier], "SchemaName", [], schemaNameUnion);

  const keyTypeParameter = ts.factory.createTypeParameterDeclaration(
    "S",
    schemaNameUnion
  );

  const typeOfMetaFunction = ts.factory.createTypeAliasDeclaration(
    undefined,
    [exportModifier],
    "TypeOf",
    [keyTypeParameter],
    ts.factory.createIndexedAccessTypeNode(
      typeMapReference,
      ts.factory.createTypeReferenceNode("S")
    )
  );

  return [schemaNameUnionDecl, typeMap, typeOfMetaFunction];
};

const extractTypeDecls = (
  node: ts.ModuleBlock,
  context: ts.TransformationContext
) => {
  const types: (ts.TypeAliasDeclaration | ts.InterfaceDeclaration)[] = [];
  ts.visitEachChild(
    node,
    (child) => {
      if (
        ts.isTypeAliasDeclaration(child) ||
        ts.isInterfaceDeclaration(child)
      ) {
        types.push(child);
      }
      return child;
    },
    context
  );
  return types;
};

async function postProcess(
  _: PluginContext
): Promise<ts.TransformerFactory<ts.SourceFile> | undefined> {
  return (tsContext: ts.TransformationContext) =>
    (root: ts.SourceFile): ts.SourceFile => {
      const visit: ts.Visitor = (node) => {
        node = ts.visitEachChild(node, visit, tsContext);

        if (ts.isModuleBlock(node)) {
          const childTypes = extractTypeDecls(node, tsContext);
          const [union, typeMap, typeOf] = createSchemaTypeMappings(childTypes);

          return ts.factory.createModuleBlock([
            ...node.statements,
            typeMap,
            union,
            typeOf
          ]);
        }
        return node;
      };

      const newFile = ts.visitNode(root, visit);
      console.log(printer.printFile(newFile));

      return newFile;
    };
}

export default plugin;
