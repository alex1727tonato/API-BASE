declare const _DEV_: boolean

declare module 'mongoose' {
  import { EnumerateData } from '@/libs/enums'
  import { Document as DocumentI, FilterQuery } from 'mongoose'
  interface Model<T extends DocumentI<any>> {
    getOptions(): Record<string, EnumerateData[]>
    smartQuery(query: { [key: string]: any }): Promise<Array<any>>
    smartCount(query: { [key: string]: any }): Promise<number>
    getOne(filter: FilterQuery<T>): Promise<T>
  }
}
