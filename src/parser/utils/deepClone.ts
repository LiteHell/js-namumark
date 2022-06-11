/**
 * Deep clones a simple object
 * @param obj Object
 * @returns Deep-cloned object
 */
export default function deepClone(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}
