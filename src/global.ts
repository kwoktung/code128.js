// Entry for the IIFE bundle (`dist/code128.global.js`), which exposes these
// as `window.Code128` for <script> users. React Native is not included.
export { encode, layout, render } from './index'
export { svg } from './svg'
export { canvas } from './canvas'
export { dom } from './dom'
