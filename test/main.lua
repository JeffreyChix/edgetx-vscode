---@type WidgetScript

local Nost = {
    name = "Nost",
    options = {
        { "Haptics", BOOL, 1 },
        { "Alert", BOOL, 1 }
    }
}


local TELE_PATH = "/SCRIPTS/TELEMETRY/"

local v, r, m, i, e = getVersion()
if string.sub(r, -4) == "simu" then
   loadScript(TELE_PATH .. "nost", "bt")(Nost.options)
end

function Nost.create(zone, options)
    local nost = loadScript(TELE_PATH .. "nost", "bt")
    return nost(options)
end

function Nost.update(widget, options)
    widget.update(options)
end

function Nost.refresh(widget, event, touchState)
    widget.run(event, touchState)
end

return Nost
