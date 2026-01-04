#!/usr/bin/env bun
import { parseCommand } from './nlp-swap-parser.ts';

const cmd = 'buy 0.001 HdZh1mUvCVJzHfTFaJJxZJFENhiFAkyiXLA5iZZTpump from Sol';
const parsed = parseCommand(cmd);
console.log('Command:', cmd);
console.log('Parsed:', parsed);

if (!parsed.valid) process.exit(1);
process.exit(0);
