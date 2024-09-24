import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Variable from "./data/Variable";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function mapJSONReplacer(_key: any, value: any) {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

export function mapJSONReviver(_key: any, value: any) {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}

export function randomHash(size: number) {
  return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

export function sliceAddress(address: string): string {
  return `${address.slice(0, 5)}...${address.slice(-10)}`
}

export function replaceVariablesInString(string: string, variables: Map<string, Variable>): string {
  let newString = string.slice(0); //Clone
  
  for (const match of string.matchAll(/\${?\w+}?/g)) {
    const variable = match[0].replace(/\W/g, "")
    const replaceWith = variables.get(variable)
    if (replaceWith) {
      newString = newString.replaceAll(match[0], replaceWith.value);
    } else {
      console.log(`Variable ${variable} undefined`);
    }
  }

  return newString;
}