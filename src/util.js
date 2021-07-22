import { isNode, getOutgoers } from 'react-flow-renderer'

import {
  NODE_HORIZONTAL_SPACING_HALF,
  NODE_VERTICAL_SPACING,
} from './constants'

export const getNextLevelOffsets = (elements, nextLevel) => {
  return elements
    .filter(isNode)
    .filter((element) => element.data.treePosition.level === nextLevel)
    .map((elem) => elem.data.treePosition.leftOffset)
}

export const updateNextLevelNodesPositionOnAdd = ({
  elements,
  sourceNodeLeftOffset,
  nextLevel,
}) => {
  const newElements = [...elements]
  newElements.forEach((element) => {
    if (isNode(element)) {
      const {
        data: {
          treePosition: { level: elementLevel, leftOffset: elementLeftOffset },
        },
      } = element
      if (elementLevel === nextLevel) {
        if (elementLeftOffset <= sourceNodeLeftOffset) {
          element.data.treePosition.leftOffset = elementLeftOffset - 1
          element.position = {
            x: (elementLeftOffset - 1) * NODE_HORIZONTAL_SPACING_HALF,
            y: elementLevel * NODE_VERTICAL_SPACING,
          }
        } else {
          element.data.treePosition.leftOffset = elementLeftOffset + 1
          element.position = {
            x: (elementLeftOffset + 1) * NODE_HORIZONTAL_SPACING_HALF,
            y: elementLevel * NODE_VERTICAL_SPACING,
          }
        }
      }
    }
  })
  return newElements
}

// TODO: write better function
export const getAllChildren = (node, elements, allChildren = []) => {
  const outgoers = getOutgoers(node, elements)
  if (outgoers.length === 0) return []
  outgoers.forEach((child) => {
    allChildren = [
      child,
      ...allChildren,
      ...getAllChildren(child, elements, allChildren),
    ]
  })
  return [...new Set(allChildren)]
}

// export const getLeftOffsets = (elements, level) => {
//   return elements
//     .filter(isNode)
//     .filter((el) => el.data.treePosition.level === level)
//     .map((el) => el.data.treePosition.leftOffset)
// }

export const getLevelNodes = (elements, level) => {
  return elements
    .filter(isNode)
    .filter((el) => el.data.treePosition.level === level)
}

export const getHighestLevel = (elements) => {
  return Math.max(
    ...elements.filter(isNode).map((el) => el.data.treePosition.level)
  )
}

export const getTreeByLevels = (elements) => {
  const highestLevel = getHighestLevel(elements)
  const levels = Array.apply(null, { length: highestLevel + 1 }).map(
    Number.call,
    Number
  )
  console.log('levels', levels)
  return levels.map((level) => getLevelNodes(elements, level))
}

const fixLevelPositions = (
  level,
  previousLevel = { position: { x: 0, y: 0 } },
  elements
) => {
  const sortedPreviousLevel = previousLevel.sort(
    (a, b) => a.position.x - b.position.x
  )
  console.log('sorted parents', sortedPreviousLevel)

  const fixedLevel = sortedPreviousLevel.reduce((acc, parent) => {
    console.log('acc parent', acc, parent)
    const children = getOutgoers(parent, elements)
    const centeredChildren = children.map((child, childIndex) => {
      // if (children.length % 2 === 0) {
      //   return {
      //     ...child,
      //     position: { ...child.position, x: parent.position.x },
      //   }
      // }
      return {
        ...child,
        position: {
          ...child.position,
          x:
            -NODE_HORIZONTAL_SPACING_HALF * children.length +
            NODE_HORIZONTAL_SPACING_HALF * childIndex * 2 +
            parent.position.x +
            NODE_HORIZONTAL_SPACING_HALF,
        },
      }
    })
    return [...acc, ...centeredChildren]
  }, [])

  return fixedLevel
}

export const fixHorizontalPositions = (elements) => {
  const treeByLevels = getTreeByLevels(elements)
  treeByLevels.forEach((level, index, array) => {
    if (index === 0) return level
    array[index] = fixLevelPositions(level, array[index - 1], elements)
  })
  console.log('fixed tree by levels', treeByLevels)
  const newElements = [...elements]
  const flattenedTree = treeByLevels.flat(2)
  console.log('fletnd tri', flattenedTree)
  newElements.forEach((el, index, array) => {
    const updatedElement = flattenedTree.find((elem) => el.id === elem.id)
    if (updatedElement) {
      array[index] = updatedElement
    }
  })
  console.log('fixed elems', newElements)
  return newElements
}
