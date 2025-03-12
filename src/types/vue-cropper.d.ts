declare module 'vue-cropper' {
  import { DefineComponent } from 'vue'
  
  export const VueCropper: DefineComponent<any, any, any>
  
  export interface vueCropperGlobal {
    version: string
    install: (app: any) => void
    VueCropper: typeof VueCropper
  }
  
  const globalCropper: vueCropperGlobal
  
  export default globalCropper
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}