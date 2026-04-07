"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTelegramConfigDebug = void 0;
const db_1 = __importDefault(require("./db"));
const getTelegramConfigDebug = async () => {
    try {
        const [configRows] = await db_1.default.query(`
      SELECT 
        bot_token AS botToken,
        group_id AS groupId,
        LENGTH(TRIM(group_id)) as groupIdLength,
        TRIM(group_id) as trimmedGroupId,
        LENGTH(TRIM(bot_token)) as botTokenLength
      FROM system_telegram_config 
      WHERE singleton_key = 1
      LIMIT 1
      `);
        const config = configRows[0] || {};
        const rawGroupId = String(config.groupId ?? '');
        const trimmedGroupId = String(config.trimmedGroupId ?? '').trim();
        const sanitizeGroupId = (value) => String(value ?? '').replace(/[^\d-]/g, '').replace(/^-+/, '-').trim();
        const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '').trim();
        const trimTelegram100Prefix = (value) => String(value ?? '').replace(/^-100/, '').trim();
        const groupIdSanitized = sanitizeGroupId(trimmedGroupId);
        const groupIdNo100 = trimTelegram100Prefix(groupIdSanitized);
        const groupIdDigits = onlyDigits(groupIdSanitized);
        const groupIdDigitsNo100 = groupIdDigits.startsWith('100') ? groupIdDigits.slice(3) : groupIdDigits;
        console.log('[DEBUG-TELEGRAM-CONFIG]', {
            rawGroupId,
            trimmedGroupId,
            groupIdLength: Number(config.groupIdLength ?? 0),
            botTokenLength: Number(config.botTokenLength ?? 0),
            hasConfig: !!trimmedGroupId,
            groupIdSanitized,
            groupIdNo100,
            groupIdDigits,
            groupIdDigitsNo100,
        });
        return {
            ok: true,
            config: {
                botTokenPreview: String(config.botToken ?? '').slice(0, 12),
                rawGroupId,
                trimmedGroupId,
                groupIdSanitized,
                groupIdNo100,
                groupIdDigits,
                groupIdDigitsNo100,
                groupIdLength: Number(config.groupIdLength ?? 0),
                botTokenLength: Number(config.botTokenLength ?? 0),
                hasConfig: !!trimmedGroupId,
            },
        };
    }
    catch (err) {
        console.error('[DEBUG-TELEGRAM-CONFIG-ERROR]', err);
        return {
            ok: false,
            error: String(err?.message ?? err),
        };
    }
};
exports.getTelegramConfigDebug = getTelegramConfigDebug;
