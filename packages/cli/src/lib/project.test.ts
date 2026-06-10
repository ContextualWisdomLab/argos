import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import {
  findProjectConfigWithPath,
  findProjectConfig,
  writeProjectConfig,
  ProjectConfig,
} from './project.js'

describe('project config utilities', () => {
  let tmpBaseDir: string

  beforeEach(() => {
    tmpBaseDir = mkdtempSync(join(tmpdir(), 'argos-test-'))
  })

  afterEach(() => {
    rmSync(tmpBaseDir, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  const dummyConfig: ProjectConfig = {
    projectId: 'test-project-id',
    orgId: 'test-org-id',
    orgName: 'test-org',
    projectName: 'test-project',
  }

  describe('writeProjectConfig', () => {
    it('should create .argos directory and project.json correctly', () => {
      writeProjectConfig(dummyConfig, tmpBaseDir)

      const argosDir = join(tmpBaseDir, '.argos')
      expect(existsSync(argosDir)).toBe(true)

      const configPath = join(argosDir, 'project.json')
      expect(existsSync(configPath)).toBe(true)

      const savedConfig = JSON.parse(readFileSync(configPath, 'utf8'))
      expect(savedConfig).toEqual(dummyConfig)

      const gitignorePath = join(argosDir, '.gitignore')
      expect(existsSync(gitignorePath)).toBe(true)
      expect(readFileSync(gitignorePath, 'utf8')).toBe('# argos 설정 (gitignore 하지 않음)\n')
    })
  })

  describe('findProjectConfigWithPath', () => {
    it('should return config and path when config exists in the current directory', () => {
      writeProjectConfig(dummyConfig, tmpBaseDir)

      const result = findProjectConfigWithPath(tmpBaseDir)
      expect(result).not.toBeNull()
      expect(result?.config).toEqual(dummyConfig)
      expect(result?.configPath).toBe(join(tmpBaseDir, '.argos', 'project.json'))
    })

    it('should traverse up and find config in a parent directory', () => {
      writeProjectConfig(dummyConfig, tmpBaseDir)
      const nestedDir = join(tmpBaseDir, 'some', 'nested', 'dir')
      mkdirSync(nestedDir, { recursive: true })

      const result = findProjectConfigWithPath(nestedDir)
      expect(result).not.toBeNull()
      expect(result?.config).toEqual(dummyConfig)
      expect(result?.configPath).toBe(join(tmpBaseDir, '.argos', 'project.json'))
    })

    it('should return null when config does not exist', () => {
      const nestedDir = join(tmpBaseDir, 'some', 'nested', 'dir')
      mkdirSync(nestedDir, { recursive: true })

      const result = findProjectConfigWithPath(nestedDir)
      expect(result).toBeNull()
    })

    it('should strip out default API URL', () => {
      const configWithDefaultUrl = {
        ...dummyConfig,
        apiUrl: 'https://argos-ai.xyz',
      }
      writeProjectConfig(configWithDefaultUrl, tmpBaseDir)

      const result = findProjectConfigWithPath(tmpBaseDir)
      expect(result).not.toBeNull()
      expect(result?.config.apiUrl).toBeUndefined()
    })

    it('should keep custom API URL', () => {
      const configWithCustomUrl = {
        ...dummyConfig,
        apiUrl: 'https://custom.api.com',
      }
      writeProjectConfig(configWithCustomUrl, tmpBaseDir)

      const result = findProjectConfigWithPath(tmpBaseDir)
      expect(result).not.toBeNull()
      expect(result?.config.apiUrl).toBe('https://custom.api.com')
    })

    it('should return null if project.json contains invalid JSON', () => {
      const argosDir = join(tmpBaseDir, '.argos')
      mkdirSync(argosDir, { recursive: true })
      writeFileSync(join(argosDir, 'project.json'), 'invalid json string')

      const result = findProjectConfigWithPath(tmpBaseDir)
      expect(result).toBeNull()
    })

    it('should use process.cwd() if startDir is not provided', () => {
      writeProjectConfig(dummyConfig, tmpBaseDir)
      vi.spyOn(process, 'cwd').mockReturnValue(tmpBaseDir)

      const result = findProjectConfigWithPath()
      expect(result).not.toBeNull()
      expect(result?.config).toEqual(dummyConfig)
    })

    it('should respect max depth (10)', () => {
      writeProjectConfig(dummyConfig, tmpBaseDir)
      // Create a directory structure 11 levels deep
      let deepDir = tmpBaseDir
      for (let i = 0; i < 11; i++) {
        deepDir = join(deepDir, `level-${i}`)
      }
      mkdirSync(deepDir, { recursive: true })

      const result = findProjectConfigWithPath(deepDir)
      expect(result).toBeNull()
    })
  })

  describe('findProjectConfig', () => {
    it('should return only the config object when found', () => {
      writeProjectConfig(dummyConfig, tmpBaseDir)

      const result = findProjectConfig(tmpBaseDir)
      expect(result).toEqual(dummyConfig)
    })

    it('should return null when not found', () => {
      const result = findProjectConfig(tmpBaseDir)
      expect(result).toBeNull()
    })
  })
})
