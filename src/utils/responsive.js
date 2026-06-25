import { Dimensions, PixelRatio } from 'react-native'

const BASE_WIDTH = 390
const BASE_HEIGHT = 844

const getWidth = () => Dimensions.get('window').width

const scale = (size) => (getWidth() / BASE_WIDTH) * size

const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor

const fontScale = (size) => PixelRatio.getFontScale() * moderateScale(size, 0.3)

const useResponsive = () => {
  const { width, height } = Dimensions.get('window')
  const horizontalRatio = width / BASE_WIDTH
  const verticalRatio = height / BASE_HEIGHT

  return {
    width,
    height,
    scale: (s) => s * horizontalRatio,
    verticalScale: (s) => s * verticalRatio,
    moderateScale: (s, factor = 0.5) => s + (s * horizontalRatio - s) * factor,
    fontScale: (s) => PixelRatio.getFontScale() * (s + (s * horizontalRatio - s) * 0.3),
  }
}

export { scale, moderateScale, fontScale, useResponsive }
