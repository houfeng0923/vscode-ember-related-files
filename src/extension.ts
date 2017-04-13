'use strict'

import * as vscode from 'vscode'
import * as fs from 'fs'
import { dirname, join, basename } from 'path'

const groups = [
  ['pod:component-js', 'pod:component-template-hbs', 'pod:component-integration-js', 'pod:component-unit-js',
  'component-js', 'component-template-hbs', 'component-style-scss', 'component-unit-js', 'component-integration-js'],
  ['pod:route-js', 'pod:route-unit-js', 'pod:route-integration-js', 'pod:controller-js','pod:controller-template-hbs', 'pod:controller-unit-js', 'pod:controller-integration-js',
  'controller-js', 'controller-template-hbs', 'route-js', 'controller-unit-js', 'controller-integration-js', 'route-unit-js', 'route-integration-js'],
  ['mixin-js', 'mixin-unit-js', 'mixin-integration-js'],
  ['model-js', 'model-unit-js', 'model-integration-js', 'adapter-js', 'adapter-unit-js', 'adapter-integration-js', 'serializer-js', 'serializer-unit-js', 'serializer-integration-js'],
  ['util-js', 'util-unit-js', 'util-integration-js'],
  ['helper-js', 'helper-unit-js', 'helper-integration-js'],
  ['service-js', 'service-unit-js', 'service-integration-js'],
  ['initializer-js', 'initializer-unit-js', 'initializer-integration-js'],
]

const types = [

  { module: 'pod:component',           exp: /^(app|addon)\/components\/(.+)\/component\.(js)$/ },
  { module: 'pod:component-template',  exp: /^(app|addon)\/components\/(.+)\/template\.(hbs)$/ },
  { module: 'pod:component-unit',      exp: /^()tests\/unit\/components\/(.+)\/component-test\.(js)$/ },
  { module: 'pod:component-integration', exp: /^()tests\/integration\/components\/(.+)\/component-test\.(js)$/ },

  { module: 'component',               exp: /^(app|addon)\/components\/(.+)\.(js)$/ },
  { module: 'component-template',      exp: /^(app|addon)\/templates\/components\/(.+)\.(hbs)$/ },
  { module: 'component-style',         exp: /^(app|addon)\/styles\/components\/(.+)\.(scss)$/ },
  { module: 'component-unit',          exp: /^()tests\/unit\/components\/(.+)-test\.(js)$/ },
  { module: 'component-integration',   exp: /^()tests\/integration\/components\/(.+)-test\.(js)$/ },
  

  { module: 'pod:route',               exp: /^(app|addon)\/(.+)\/route\.(js)$/ },
  { module: 'pod:route-unit',          exp: /^()tests\/unit\/(.+)\/route-test\.(js)$/ },
  { module: 'pod:route-integration',   exp: /^()tests\/integration\/(.+)\/route-test\.(js)$/ },
  { module: 'pod:controller',          exp: /^(app|addon)\/(.+)\/controller\.(js)$/ },
  { module: 'pod:controller-template', exp: /^(app|addon)\/(.+)\/template\.(hbs)$/ },
  { module: 'pod:controller-unit',     exp: /^()tests\/unit\/(.+)\/controller-test\.(js)$/ },
  { module: 'pod:controller-integration', exp: /^()tests\/integration\/(.+)\/controller-test\.(js)$/ },

  { module: 'route',                   exp: /^(app|addon)\/routes\/(.+)\.(js)$/ },
  { module: 'route-unit',              exp: /^()tests\/unit\/routes\/(.+)-test\.(js)$/ },
  { module: 'route-integration',       exp: /^()tests\/integration\/routes\/(.+)-test\.(js)$/ },
  { module: 'controller',              exp: /^(app|addon)\/controllers\/(.+)\.(js)$/ },
  { module: 'controller-unit',         exp: /^()tests\/unit\/controllers\/(.+)-test\.(js)$/ },
  { module: 'controller-integration',  exp: /^()tests\/integration\/controllers\/(.+)-test\.(js)$/ },
  { module: 'controller-template',     exp: /^(app|addon)\/templates\/(.+)\.(hbs)$/ },
  { module: 'model',                   exp: /^(app|addon)\/models\/(.+)\.(js)$/ },
  { module: 'model-unit',              exp: /^()tests\/unit\/models\/(.+)-test\.(js)$/ },
  { module: 'model-integration',       exp: /^()tests\/integration\/models\/(.+)-test\.(js)$/ },
  { module: 'util',                    exp: /^(app|addon)\/utils\/(.+)\.(js)$/ },
  { module: 'util-unit',               exp: /^()tests\/unit\/utils\/(.+)-test\.(js)$/ },
  { module: 'util-integration',        exp: /^()tests\/integration\/utils\/(.+)-test\.(js)$/ },
  { module: 'helper',                  exp: /^(app|addon)\/helpers\/(.+)\.(js)$/ },
  { module: 'helper-unit',             exp: /^()tests\/unit\/helpers\/(.+)-test\.(js)$/ },
  { module: 'helper-integration',      exp: /^()tests\/integration\/helpers\/(.+)-test\.(js)$/ },
  { module: 'mixin',                   exp: /^(app|addon)\/mixins\/(.+)\.(js)$/ },
  { module: 'mixin-unit',              exp: /^()tests\/unit\/mixins\/(.+)-test\.(js)$/ },
  { module: 'mixin-integration',       exp: /^()tests\/integration\/mixins\/(.+)-test\.(js)$/ },
  { module: 'adapter',                 exp: /^(app|addon)\/adapters\/(.+)\.(js)$/ },
  { module: 'adapter-unit',            exp: /^()tests\/unit\/adapters\/(.+)-test\.(js)$/ },
  { module: 'adapter-integration',     exp: /^()tests\/integration\/adapters\/(.+)-test\.(js)$/ },
  { module: 'serializer',              exp: /^(app|addon)\/serializers\/(.+)\.(js)$/ },
  { module: 'serializer-unit',         exp: /^()tests\/unit\/serializers\/(.+)-test\.(js)$/ },
  { module: 'serializer-integration',  exp: /^()tests\/integration\/serializers\/(.+)-test\.(js)$/ },
  { module: 'service',                 exp: /^(app|addon)\/services\/(.+)\.(js)$/ },
  { module: 'service-unit',            exp: /^()tests\/unit\/services\/(.+)-test\.(js)$/ },
  { module: 'service-integration',     exp: /^()tests\/integration\/services\/(.+)-test\.(js)$/ },
  { module: 'initializer',             exp: /^(app|addon)\/initializers\/(.+)\.(js)$/ },
  { module: 'initializer-unit',        exp: /^()tests\/unit\/initializers\/(.+)-test\.(js)$/ },
  { module: 'initializer-integration', exp: /^()tests\/integration\/initializers\/(.+)-test\.(js)$/ },
]

const HOST_TYPE_CACHE = {};

function detectHostType() {

  const hostPath = vscode.workspace.rootPath
  if (!HOST_TYPE_CACHE[hostPath]) {
    HOST_TYPE_CACHE[hostPath] = fs.existsSync(join(String(vscode.workspace.rootPath), 'addon')) ? 'addon' : 'app'
  }

  return HOST_TYPE_CACHE[hostPath];
}

export function detectType(path): IType {

  return types
    .map((type) => {
      const { module, exp} = type
      const m = path.match(exp)
      
      if (m) {
        const hostType = m[1] || detectHostType()
        const part = m[2]
        const ext = m[3]
        
        return { hostType, path, part, key: `${module}-${ext}` }
      }
    })
    .find((type) => Boolean(type))
}

export function getRelatedTypeKeys(typeKey: string): string[] {
    return groups
      .find((group) => group.indexOf(typeKey) !== -1)
      .filter((key) => key !== typeKey);
}

export function getPath(sourceType: IType, typeKey: string): string {

  const { hostType, part } = sourceType
  const [, , , pod, type, , subtype, ext] = typeKey.match(/^((([a-z]+):)?([a-z]+))(-([a-z]+))?-([a-z]+)$/)

  let filePath, basePath;

  if (pod) {
    switch (subtype) {
      case 'integration':
      case 'unit':
        if (type === 'component') {
          return `tests/${subtype}/${type}s/${part}/${type}-test.${ext}`
        }
        return `tests/${subtype}/${part}/${type}-test.${ext}` 
      
      case 'style':
        return `${hostType}/styles/${type}s/${part}.${ext}`
      
      case 'template':
        if (type === 'controller') {
          return `${hostType}/${part}/template.${ext}`  
        }
        return `${hostType}/${type}s/${part}/template.${ext}` 
    
      default: 
        if (type === 'route' || type === 'controller') {
          return `${hostType}/${part}/${type}.${ext}`   
        }
        return `${hostType}/${type}s/${part}/${type}.${ext}` 
    }
  } else {
    switch (subtype) {
      case 'integration':
      case 'unit': 
        return `tests/${subtype}/${type}s/${part}-test.${ext}`
      
      case 'style':
        return `${hostType}/styles/${type}s/${part}.${ext}`
      
      case 'template':
        if (type === 'controller') { 
          return `${hostType}/templates/${part}.${ext}`
        } 
        return `${hostType}/templates/${type}s/${part}.${ext}`
    
      default: 
        return `${hostType}/${type}s/${part}.${ext}`
    }
  }
 
}

function typeKeyToLabel(typeKey: string) : string {
  typeKey = typeKey.replace('pod:', '')
  switch (typeKey) {
    case 'component-js':
      return 'Component'

    case 'component-style-scss':
      return 'Stylesheet'

    case 'route-js':
      return 'Route'

    case 'controller-js':
      return 'Controller'
    
    case 'mixin-js':
      return 'Mixin'
    
    case 'model-js':
      return 'Model'

    case 'util-js':
      return 'Util'
    
    case 'helper-js':
      return 'Helper'
    
    case 'adapter-js':
      return 'Adapter'
    
    case 'serializer-js':
      return 'Serializer'

    case 'service-js':
      return 'Service'

    case 'initializer-js':
      return 'Initializer'

    case 'component-template-hbs':
    case 'controller-template-hbs':
      return 'Template'

    case 'component-unit-js':
    case 'route-unit-js':
    case 'controller-unit-js':
    case 'mixin-unit-js':
    case 'model-unit-js':
    case 'util-unit-js':
    case 'helper-unit-js':
    case 'adapter-unit-js':
    case 'serializer-unit-js':
    case 'service-unit-js':
    case 'initializer-unit-js':
      return 'Unit Test'
    
    case 'component-integration-js':
    case 'route-integration-js':
    case 'controller-integration-js':
    case 'mixin-integration-js':
    case 'model-integration-js':
    case 'util-integration-js':
    case 'helper-integration-js':
    case 'adapter-integration-js':
    case 'serializer-integration-js':
    case 'service-integration-js':
    case 'initializer-integration-js':
      return 'Integration Test'
  }

  return typeKey
}

interface IType {
  hostType: string
  key: string
  path: string
  part: string
}

class TypeItem implements vscode.QuickPickItem {

  label: string

  description: string

  detail?: string

  constructor(sourceType: IType, typeKey: string) {
    this.label = typeKeyToLabel(typeKey)
    this.description = getPath(sourceType, typeKey)
  }

  public path() : string {
    return join(vscode.workspace.rootPath, this.description)
  }

  public uri() : vscode.Uri {
    return vscode.Uri.file(this.path())
  }

  public exists() : boolean {
    return fs.existsSync(this.path())
  }
}

function open(item: TypeItem) {
  vscode.workspace.openTextDocument(item.uri()).then((doc) =>
    vscode.window.showTextDocument(doc)
  )
}

function config<T>(key: string) : T {
  return vscode.workspace.getConfiguration('emberRelatedFiles').get<T>(key);
}

export function activate(context: vscode.ExtensionContext) {

  let disposable = vscode.commands.registerCommand('extension.relatedFiles', () => {

    if (!vscode.window.activeTextEditor) {
      return
    }

    const relativeFileName = vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.fileName)
    const type = detectType(relativeFileName)

    if (!type) { return; }

    const items = getRelatedTypeKeys(type.key)
      .map((typeKey) => new TypeItem(type, typeKey))
      .filter((type) => type.exists())

    if (items.length === 0) { return; }

    if (items.length === 1 && !config('showQuickPickForSingleOption')) {
      return open(items.pop())
    }
    
    vscode.window.showQuickPick(items, { placeHolder: 'Select File', matchOnDescription: true }).then((item) => {
      if (item) {
        open(item)
      }
    })
  })

  context.subscriptions.push(disposable)
}

export function deactivate() { }
