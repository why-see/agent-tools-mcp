import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEmail,validateUrl,validatePhoneE164,validateUuid,validateIsoDate,validateIban,validateJson,slugify,stripAnsi,normalizeWhitespace} from '../src/tools.js';

test('email syntax only',()=>{
  assert.equal(validateEmail('founder@example.com').valid,true);
  assert.equal(validateEmail('user@localhost').valid,false);
  assert.equal(validateEmail('double@@example.com').valid,false);
});
test('URL requires HTTP(S)',()=>{
  assert.equal(validateUrl('https://example.com/path').valid,true);
  assert.equal(validateUrl('javascript:alert(1)').valid,false);
  assert.equal(validateUrl('not a url').valid,false);
});
test('phone E164',()=>{
  assert.equal(validatePhoneE164('+66812345678').valid,true);
  assert.equal(validatePhoneE164('0812345678').valid,false);
});
test('UUID',()=>{
  assert.equal(validateUuid('550e8400-e29b-41d4-a716-446655440000').valid,true);
  assert.equal(validateUuid('550e8400e29b41d4a716446655440000').valid,false);
});
test('ISO date leap years',()=>{
  assert.equal(validateIsoDate('2024-02-29').valid,true);
  assert.equal(validateIsoDate('2025-02-29').valid,false);
  assert.equal(validateIsoDate('1900-02-29').valid,false);
  assert.equal(validateIsoDate('2000-02-29').valid,true);
});
test('IBAN checksum',()=>{
  assert.equal(validateIban('GB82 WEST 1234 5698 7654 32').valid,true);
  assert.equal(validateIban('GB82 WEST 1234 5698 7654 33').valid,false);
});
test('JSON',()=>{
  assert.equal(validateJson('{"a":1}').valid,true);
  assert.equal(validateJson('{a:1}').valid,false);
});
test('slug generation',()=>{
  assert.equal(slugify('Café & Startup 2026!'),'cafe-startup-2026');
  assert.equal(slugify('---'),'');
});
test('ANSI removal',()=>{
  assert.equal(stripAnsi('\x1b[31mRed\x1b[0m'),'Red');
});
test('whitespace normalization',()=>{
  assert.equal(normalizeWhitespace('  abc\n\tdef  '),'abc def');
});
