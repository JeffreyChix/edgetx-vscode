---@type WidgetScript

-- local iNav = nil
-- local options = {
-- 	{ "Restore", BOOL, 1},
-- 	{ "Text", COLOR, WHITE},
-- 	{ "Warning", COLOR, YELLOW}
-- }

-- local TELE_PATH = "/SCRIPTS/TELEMETRY/"
-- local v, r, m, i, e = getVersion()
-- if string.sub(r, -4) == "simu" then
--    loadScript(TELE_PATH .. "iNav", "bt")(zone, options)
-- end

-- -- Run once at the creation of the widget
-- local function create(zone, options)
--    local iNav = loadScript(TELE_PATH .. "iNav","bt")(zone, options)
--    iNav.background()
--    return iNav
-- end

-- -- This function allow updates when you change widgets settings
-- local function update(widget, options)
--    widget.update( options)
-- end

-- -- Called periodically when custom telemetry screen containing widget is visible.
-- local function refresh(widget, event, touchState)
--    widget.run(event, touchState)
-- end

-- -- Called periodically when custom telemetry screen containing widget is not visible
-- local function background(widget)
--   widget.background()
-- end

-- return {
--   name = "iNav",
--   create = create,
--   refresh = refresh,
--   options = options,
--   update = update,
--   background = background
-- }


-- WIDGETS/Shapes/main.lua

local function create(zone, options)
   return { zone = zone, options = options }
end

local function update(widget, options)
   widget.options = options
end

local function background(widget)
end

local function refresh(widget, event, touchState)
   local z = widget.zone
   local cx = z.x + z.w / 2
   local cy = z.y + z.h / 2

   -- background
   lcd.drawFilledRectangle(z.x, z.y, z.w, z.h, BLACK)

   -- outer border
   lcd.drawRectangle(z.x + 2, z.y + 2, z.w - 4, z.h - 4, WHITE)

   -- filled circle in center
   lcd.drawFilledCircle(cx, cy, 20, WHITE)

   -- four corner dots
   lcd.drawFilledCircle(z.x + 10, z.y + 10, 4, BLUE)
   lcd.drawFilledCircle(z.x + z.w - 10, z.y + 10, 4, BLUE)
   lcd.drawFilledCircle(z.x + 10, z.y + z.h - 10, 4, BLUE)
   lcd.drawFilledCircle(z.x + z.w - 10, z.y + z.h - 10, 4, BLUE)

   -- crosshair lines through center
   lcd.drawLine(cx, z.y + 4, cx, z.y + z.h - 4, SOLID, BLUE)
   lcd.drawLine(z.x + 4, cy, z.x + z.w - 4, cy, SOLID, BLUE)

   -- label
   lcd.drawText(z.x + 4, z.y + 4, "SHAPES", DBLSIZE + BOLD + BLINK + GREEN)
end

return {
   name       = "Shapes",
   options    = {},
   create     = create,
   update     = update,
   background = background,
   refresh    = refresh,
}
