import { Project } from "ts-morph"

const project = new Project({})

project.addSourceFilesAtPaths("src/**/*.ts")
project.addSourceFilesAtPaths("src/**/*.tsx")

const files = project.getSourceFiles()

function pathIsAbsolute(path: string) {
  const layers = ["app", "shared", "entities", "features", "widgets", "pages"]

  if (layers.some((layer) => path.startsWith(layer))) {
    return true
  }
}

files.forEach((sourceFile) => {
  const importDeclarations = sourceFile.getImportDeclarations()

  importDeclarations.forEach((importDeclaration) => {
    // "./module/someFile" or "src/module/someFile"
    const path = importDeclaration.getModuleSpecifierValue()
    if (pathIsAbsolute(path)) {
      importDeclaration.setModuleSpecifier(`@/${path}`)
    }
  })
})

project.save()
