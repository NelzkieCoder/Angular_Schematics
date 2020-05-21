import { Rule, SchematicContext, Tree, url, apply, move, mergeWith, MergeStrategy, template, SchematicsException, chain } from '@angular-devkit/schematics';
import { normalize, strings } from '@angular-devkit/core';
import { WorkspaceSchema } from '@angular-devkit/core/src/experimental/workspace';
import * as ts from 'typescript'
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function hello(_options: HelloSchematics): Rule {
  const folderpath = normalize(strings.dasherize(_options.path + "/" + _options.name))

  console.log(folderpath)
  return (tree: Tree, _context: SchematicContext) => {
    const workspace = getWorkSpace(_options, tree)
    console.log(workspace)
    const templateRule = moveTemplateToPath(_options)
    const updateModule = updateRootModule(_options, workspace)
    const chainedRule = chain([templateRule, updateModule])
    // tree.create('nice.js',`console.log('Hello ${name}');`);
    return chainedRule(tree, _context);
  };
}

function moveTemplateToPath(_options: any): Rule {
  let files = url("./files")
  const folderpath = normalize(_options.path + "/" + _options.name)
  
  const newTree = apply(files,[
    move(folderpath),
    template({
      ...strings, 
      ..._options
    })
  ])
  return mergeWith(newTree, MergeStrategy.Overwrite)
}

function getWorkSpace(_options: HelloSchematics, tree: Tree) : WorkspaceSchema {
  const workspace = tree.read("/angular.json");
  if(!workspace) {
    throw new SchematicsException("Angular.json not found");
  }
  return JSON.parse(workspace.toString());
}

function updateRootModule(_options: any, workspace: WorkspaceSchema): Rule {
  return (tree: Tree, _context: SchematicContext): Tree => {

    _options.project = (_options.project === 'defaultProject') ? workspace.defaultProject : _options.project

    const project = workspace.projects[_options.project];
    const moduleName = strings.dasherize(_options.name);
    const modulePath = strings.dasherize(_options.path);
    const exportedModule = strings.classify(_options.name);
    console.log(project.root)
    const rootModulePath = `${project.root}/` +
                            `${project.sourceRoot}/` +
                            `${project.prefix}/` +
                            `${project.prefix}.module.ts`;
    const importContent = `import{ ${exportedModule} } from '${modulePath}/${moduleName}/${moduleName}.module' \n` ;

    const moduleFile = getAsSourceFile(tree, rootModulePath)
    const lastImportEndPosition = fildLastImportedPosition(moduleFile)
    const importArrayEndPosition = findImportedArray(moduleFile)

    const rec = tree.beginUpdate(rootModulePath);
    rec.insertLeft(lastImportEndPosition + 1, importContent);
    rec.insertLeft(importArrayEndPosition - 1, `, ${exportedModule}Module`);
    tree.commitUpdate(rec);
    return tree
  }
}

function getAsSourceFile(tree: Tree, path: string): ts.SourceFile {
  const file = tree.read(path);
  if(!file) {
    throw new SchematicsException(`${path} not found`)
  }
  return ts.createSourceFile(path, file.toString(), ts.ScriptTarget.Latest, true);
}

function fildLastImportedPosition(file: ts.SourceFile): number {
  let pos: number = 0
  file.forEachChild((child: ts.Node) => {
    if(child.kind === ts.SyntaxKind.ImportDeclaration) {
      pos = child.end;
    }
  })
  return pos;
}

function findImportedArray(file: ts.SourceFile): number {
  let position: number = 0
  file.forEachChild((node: ts.Node) => {
    if(node.kind == ts.SyntaxKind.ClassDeclaration) {
      node.forEachChild((classChild: ts.Node) => {
        if(classChild.kind == ts.SyntaxKind.Decorator) {
          classChild.forEachChild((moduleDeclaration: ts.Node) => {
            moduleDeclaration.forEachChild((objectLiteral: ts.Node) => {
              objectLiteral.forEachChild((property: ts.Node) => {
                if(property.getFullText().includes('imports')) {
                  position = property.end
                }
              })
            })
          })
        }
      })
    }
  })

  return position;
}
