import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMAS_DIR = path.resolve(__dirname, '../../references/schemas');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schemaCache = new Map();

export function getSchemaValidator(schemaName) {
  if (schemaCache.has(schemaName)) {
    return schemaCache.get(schemaName);
  }

  const schemaPath = path.join(SCHEMAS_DIR, `${schemaName}.schema.json`);
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  const schemaContent = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const validate = ajv.compile(schemaContent);
  schemaCache.set(schemaName, validate);
  return validate;
}

export function validateData(schemaName, data) {
  const validate = getSchemaValidator(schemaName);
  const valid = validate(data);
  if (!valid) {
    return {
      valid: false,
      errors: validate.errors
    };
  }
  return { valid: true, errors: [] };
}
