/*
 * Copyright (c) 2021-present, the hapjs-platform Project Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

import loaderUtils from 'loader-utils'
import { parseStyle } from '@hap-toolkit/compiler'
import { logWarn, compileOptionsObject } from '@hap-toolkit/shared-utils'

import { convertPath, getWebpackOptions } from './common/utils'

const componentId = (() => {
  const resourceMap = new Map()
  let uniqueId = 1

  return {
    get(resourcePath) {
      return resourceMap.get(resourcePath)
    },
    add(resourcePath) {
      if (!resourceMap.has(resourcePath)) {
        // 生成唯一ID
        resourceMap.set(resourcePath, uniqueId++)
      }
    }
  }
})()

export default function styleLoader(code) {
  const self = this
  const options = loaderUtils.parseQuery(this.resourceQuery)
  const cardEntry = options.cardEntry
  const loaderQuery = loaderUtils.parseQuery(this.query)
  const suppresslogs = !!getWebpackOptions(this).suppresslogs
  const resourcePath = this.resourcePath // 当前文件绝对路径

  const { depList, log, depFiles, jsonStyle } = parseStyle({
    cardEntry: options.cardEntry,
    filePath: resourcePath,
    code: code,
    query: loaderQuery
  })

  if (compileOptionsObject.enableExtractCss && !options.newJSCard) {
    componentId.add(resourcePath)
    if (jsonStyle) {
      jsonStyle[`@info`] = {
        styleObjectId: componentId.get(resourcePath)
      }
    }
  }

  const parsed = JSON.stringify(jsonStyle, null, 2)

  if (log && log.length) {
    logWarn(this, log, suppresslogs)
  }

  // Recompile while dependency changed
  depList.forEach(function (depFilePath) {
    self.addDependency(depFilePath)
  })

  depFiles.forEach((file) => {
    let fileName = file
    if (cardEntry && file.startsWith('/node_modules')) {
      fileName = decodeURIComponent(cardEntry) + file
    }
    self.addDependency(convertPath(fileName))
  })

  return `module.exports = ${parsed}`
}
