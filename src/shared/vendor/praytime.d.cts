export class PrayTime {
  constructor(method?: string)
  location(value: [number, number]): this
  timezone(value: string): this
  adjust(value: Record<string, string | number>): this
  tune(value: Record<string, number>): this
  format(value: string): this
  times(date: [number, number, number]): Record<string, number | string>
}
