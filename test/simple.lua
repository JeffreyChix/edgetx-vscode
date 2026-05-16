---@type TelemetryScript

-- =============================================
-- Telemetry Script: logs and displays telemetry
-- Place in: SCRIPTS/TELEMETRY/telem.lua
-- =============================================

local function init()
  -- called once on script load
end

local function run(event)
  local rssi  = getValue("RSSI")
  local vbat  = getValue("RxBt")
  local alt   = getValue("Alt")

  -- clear screen
  lcd.clear()

  -- title
  lcd.drawText(1, 1, "Telemetry", BOLD)
  lcd.drawLine(0, 10, LCD_W, 10, SOLID, BLACK)

  -- RSSI
  lcd.drawText(4, 14, "RSSI:", SMLSIZE)
  lcd.drawNumber(44, 14, rssi, SMLSIZE)
  lcd.drawText(68, 14, "dB", SMLSIZE)

  -- Battery
  lcd.drawText(4, 26, "VBAT:", SMLSIZE)
  lcd.drawNumber(44, 26, vbat * 10, SMLSIZE + PREC1)
  lcd.drawText(68, 26, "V", SMLSIZE)

  -- Altitude
  lcd.drawText(4, 38, "ALT:", SMLSIZE)
  lcd.drawNumber(44, 38, alt * 10, SMLSIZE + PREC1)
  lcd.drawText(68, 38, "m", SMLSIZE)

  -- low battery warning
  if vbat > 0 and vbat < 3.5 then
    lcd.drawText(4, 52, "LOW BATTERY!", SMLSIZE + BLINK + INVERS)
  end

  return 0
end

return {
  init = init,
  run  = run,
}