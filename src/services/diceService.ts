import { reactive } from 'vue'

interface InitiativeEntry {
  id: string
  name: string
  value: number
}

interface DiceState {
  defaultDice: number
  attributes: Record<string, number>
  initiativeList: InitiativeEntry[]
}

const state = reactive<DiceState>({
  defaultDice: 100,
  attributes: {},
  initiativeList: []
})

interface DiceResult {
  type: string
  result: string
  details?: any
}

// 解析骰子表达式，如 3d6
function parseDiceExpression(expr: string): { count: number; faces: number } {
  const match = expr.match(/^(\d+)?d(\d+)$/i)
  if (!match) throw new Error('无效的骰子表达式')
  return {
    count: match[1] ? parseInt(match[1]) : 1,
    faces: parseInt(match[2])
  }
}

// 生成随机数
function rollDice(faces: number): number {
  return Math.floor(Math.random() * faces) + 1
}

// 执行骰子命令
export function executeDiceCommand(command: string): DiceResult {
  const [cmd, ...args] = command.slice(1).split(/\s+/)

  try {
    switch (cmd.toLowerCase()) {
      case 'r': {
        const expr = args[0] || `1d${state.defaultDice}`
        const { count, faces } = parseDiceExpression(expr)
        const rolls = Array(count).fill(0).map(() => rollDice(faces))
        const sum = rolls.reduce((a, b) => a + b, 0)
        return {
          type: 'roll',
          result: `掷骰结果：${sum} (${rolls.join('+')})`
        }
      }

      case 'set': {
        const faces = parseInt(args[0])
        if (isNaN(faces) || faces <= 0) throw new Error('无效的面数')
        state.defaultDice = faces
        return {
          type: 'set',
          result: `默认骰子已设置为${faces}面骰`
        }
      }

      case 'coc': {
        const attributes = ['力量', '体质', '体型', '敏捷', '外貌', '智力', '意志', '教育', '幸运']
        const results = attributes.map(attr => {
          const value = Math.floor(Math.random() * 76) + 15 // 15-90
          return { attribute: attr, value }
        })
        return {
          type: 'coc',
          result: '属性生成结果：\n' + results.map(r => `${r.attribute}: ${r.value}`).join('\n')
        }
      }

      case 'st': {
        if (args.length < 2) throw new Error('缺少参数')
        const [attr, valueStr] = args
        const value = parseInt(valueStr)
        if (isNaN(value)) throw new Error('无效的数值')
        state.attributes[attr] = value
        return {
          type: 'st',
          result: `已将${attr}设置为${value}`
        }
      }

      case 'rc': {
        const skill = args[0]
        const value = state.attributes[skill]
        if (value === undefined) throw new Error(`未找到技能：${skill}`)
        const roll = rollDice(100)
        let result = ''
        if (roll <= value / 5) result = '极难成功'
        else if (roll <= value / 2) result = '困难成功'
        else if (roll <= value) result = '成功'
        else result = '失败'
        return {
          type: 'rc',
          result: `${skill}检定：${roll}/${value} - ${result}`
        }
      }

      case 'sc': {
        if (args.length === 0) throw new Error('缺少参数')
        const [successLoss, failureLoss] = args[0].split('/')
        const sanity = state.attributes['理智'] || 0
        const roll = rollDice(100)
        let loss = 0

        if (roll <= sanity) {
          loss = parseInt(successLoss)
          if (isNaN(loss)) throw new Error('无效的理智损失值')
          return {
            type: 'sc',
            result: `理智检定成功：${roll}/${sanity}\n损失${loss}点理智`
          }
        } else {
          const { count, faces } = parseDiceExpression(failureLoss)
          loss = Array(count).fill(0).map(() => rollDice(faces)).reduce((a, b) => a + b, 0)
          return {
            type: 'sc',
            result: `理智检定失败：${roll}/${sanity}\n损失${loss}点理智`
          }
        }
      }

      case 'en': {
        const skill = args[0]
        const value = state.attributes[skill]
        if (value === undefined) throw new Error(`未找到技能：${skill}`)
        const roll = rollDice(100)
        if (roll > value) {
          const growth = Array(1).fill(0).map(() => rollDice(10)).reduce((a, b) => a + b, 0)
          state.attributes[skill] = value + growth
          return {
            type: 'en',
            result: `${skill}成长检定成功：${roll}/${value}\n${skill}提升${growth}点`
          }
        } else {
          return {
            type: 'en',
            result: `${skill}成长检定失败：${roll}/${value}`
          }
        }
      }

      case 'ri': {
        let modifier = 0
        let name = ''
        let count = 1

        // 解析参数
        const argStr = args.join(' ')
        const modMatch = argStr.match(/[+-]\d+/)
        if (modMatch) {
          modifier = parseInt(modMatch[0])
          argStr.replace(modMatch[0], '')
        }

        const countMatch = argStr.match(/(\d+)#/)
        if (countMatch) {
          count = parseInt(countMatch[1])
          name = argStr.split('#')[1]?.trim() || ''
        } else {
          name = argStr.trim()
        }

        // 生成先攻值
        const entries: InitiativeEntry[] = []
        for (let i = 0; i < count; i++) {
          const roll = rollDice(20)
          const total = roll + modifier
          const entryName = count > 1 ? `${name}${i + 1}` : name
          entries.push({
            id: `${name}_${Date.now()}_${i}`,
            name: entryName,
            value: total
          })
        }

        // 更新先攻列表
        state.initiativeList.push(...entries)
        state.initiativeList.sort((a, b) => b.value - a.value)

        return {
          type: 'initiative',
          result: `先攻投骰结果：\n${entries.map(e => `${e.name}: ${e.value}`).join('\n')}\n\n当前先攻顺序：\n${state.initiativeList.map(e => `${e.name}: ${e.value}`).join('\n')}`
        }
      }

      default:
        throw new Error('未知的命令')
    }
  } catch (error) {
    return {
      type: 'error',
      result: error instanceof Error ? error.message : '未知错误'
    }
  }
}