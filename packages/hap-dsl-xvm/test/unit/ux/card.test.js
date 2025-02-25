/*
 * Copyright (c) 2021-present, the hapjs-platform Project Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path')
const { wipeDynamic } = require('hap-dev-utils')
const { resolveTestEntries, compileFiles } = require('../../utils')

/**
 * Component
 */
describe('Card 编译测试', () => {
  it('compile-card', async () => {
    const basedir = path.resolve(__dirname, '../../case/ux/')
    const entries = resolveTestEntries(basedir, 'TestCard')

    const stats = await compileFiles(entries)
    const json = stats.toJson({source: true})

    json.modules.forEach(module => {
      expect(wipeDynamic(module.source)).toMatchSnapshot(module.id)
    })
  }, 50 * 60 * 1000)
})
