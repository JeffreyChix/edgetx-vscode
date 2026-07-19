---@type TelemetryScript

local telemetryScript = {}

telemetryScript.init = function()
    --- Called once when the script is loaded
end

telemetryScript.background = function()
    --- Called when the script is not visible on screen
end

telemetryScript.run = function(event)
    --- Called every cycle when the telemetry page is active
    

    print("Hey Jeffrey")
end


return telemetryScript
