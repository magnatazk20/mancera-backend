# TODO - Fix persistência de dias/horários em /adf/withdraw-config

- [x] Atualizar schema de `system_withdraw_config` para incluir:
  - `withdraw_start_time`
  - `withdraw_end_time`
  - `withdraw_allowed_days`
- [x] Atualizar GET `/api/admin/withdraw-config` para retornar esses campos
- [x] Atualizar POST `/api/admin/withdraw-config` para validar e salvar esses campos
- [x] Executar validação rápida (build) no backend
- [x] Atualizar checklist final
- [ ] Commit e push das alterações
