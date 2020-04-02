export default () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    // tslint:disable-next-line:no-bitwise
    const randomHex = (Math.random() * 16) | 0
    // tslint:disable-next-line:no-bitwise
    const value = character === 'x' ? randomHex : (randomHex & 0x3) | 0x8
    return value.toString(16)
  })
}
