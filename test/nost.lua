---@type TelemetryScript

--[[
 - Name: Nost (Nose Tracker)
 - Version: 1.0
 - Author: Jeffrey Nwankwo
]]
local options = ...
local nost = {}
local settings = {
    alertUser = options == nil or options.Alert == 1,
    playHaptic = options == nil or options.Haptics == 1
}

local cx, cy = LCD_W / 2, LCD_H / 2
local radius = 65
local arrowLen = 55

local yaw_id = -1
local raw_yaw = nil
local fm_id = -1        -- Flght mode
local drone_heading = 0 -- Drone's yaw value converted to degrees (360)
local pilot_heading = 0 -- Would read from serial port much later

local playHapticOnNoseSouth = true


local function getTelemetryId(name)
    local field = getFieldInfo(name)
    return field and field.id or -1
end


local function drawTicks()
    for deg = 0, 330, 30 do
        local rad = math.rad(deg)

        local x1 = cx + (radius - 5) * math.sin(rad)
        local y1 = cy - (radius - 5) * math.cos(rad)

        local x2 = cx + radius * math.sin(rad)
        local y2 = cy - radius * math.cos(rad)

        lcd.drawLine(x1, y1, x2, y2, SOLID, WHITE)
    end
end


local function drawArrow(angle, color)
    local rad = math.rad(angle)

    local tx = cx + arrowLen * math.sin(rad)
    local ty = cy - arrowLen * math.cos(rad)

    lcd.drawLine(cx, cy, tx, ty, SOLID, color)

    local p2 = math.rad(angle + 160)
    local p3 = math.rad(angle - 160)

    local x2 = tx + 14 * math.sin(p2)
    local y2 = ty - 14 * math.cos(p2)

    local x3 = tx + 14 * math.sin(p3)
    local y3 = ty - 14 * math.cos(p3)

    lcd.drawFilledTriangle(tx, ty, x2, y2, x3, y3, color)
end

local function getDirectionText(angle)
    local absAngle = math.abs(angle)

    local side = absAngle > 0 and absAngle <= 180 and "right" or "left"

    if (absAngle >= 157.5 and absAngle <= 205) then
        if (settings.playHaptic and playHapticOnNoseSouth) then
            playHaptic(25, 3000, PLAY_NOW)
            playHapticOnNoseSouth = false
        end
        return "Nose towards you"
    end

    playHapticOnNoseSouth = true

    if 334.5 <= absAngle or absAngle <= 22.5 then return "Nose forward" end
    if (285 <= absAngle or absAngle <= 67.5) then return "Nose forward and to your " .. side end
    if (265 <= absAngle or absAngle <= 112.5) then return "Nose is to your " .. side end


    return "Nose towards you and to your " .. side
end

local function getFlightMode()
    local fm = getValue(fm_id)
    if (fm == nil or fm == 0) then return "---" end

    if (fm == "ALTH" and settings.alertUser) then
        playTone(2550, 160, 500, PLAY_NOW)
    end

    return fm
end

local function updateSettings(opts)
    settings.alertUser = opts.Alert == 1
    settings.playHaptic = opts.Haptics == 1
end

local function drawRadar()
    lcd.clear(BLACK)

    lcd.drawCircle(cx, cy, radius, WHITE)

    drawTicks()

    lcd.drawText(cx, cy - radius - 25, "N", WHITE + CENTER + BOLD)
    lcd.drawText(cx, cy + radius + 5, "S", WHITE + CENTER + BOLD)
    lcd.drawText(cx + radius + 10, cy - 10, "E", WHITE + BOLD)
    lcd.drawText(cx - radius - 20, cy - 10, "W", WHITE + BOLD)

    local relativeAngle = drone_heading - pilot_heading;
    local fm = getFlightMode()

    drawArrow(relativeAngle, RED)

    lcd.drawFilledCircle(cx, cy, 4, WHITE)

    lcd.drawText(cx, cy + 10, "You", WHITE + CENTER + SMLSIZE)

    lcd.drawText(10, 10, "FM: " .. fm, fm == "ALTH" and settings.alertUser and RED + BLINK or WHITE)
    if (fm == "ALTH" and settings.alertUser) then
        lcd.drawText(10, 40, "Watch throttle level before release", SMLSIZE + YELLOW)
    end

    lcd.drawText(
        LCD_W - 10,
        10,
        string.format("Relative angle: %d°", relativeAngle),
        RED + RIGHT
    )

    lcd.drawText(cx, LCD_H - 30, getDirectionText(relativeAngle), GREEN + BOLD + BLINK + CENTER)
end

local function compute()
    yaw_id = getTelemetryId("Yaw")
    fm_id = getTelemetryId("FM")

    raw_yaw = getValue(yaw_id)

    drone_heading = (raw_yaw * 180) / math.pi
    if drone_heading < 0 then drone_heading = drone_heading + 360 end
end


--[[ SCRIPT FUNCTIONS ]] --

function nost.update(opts)
    updateSettings(opts)
    options = opts
end

function nost.run()
    compute()

    if yaw_id == -1 or raw_yaw == nil then
        lcd.clear(BLACK)
        lcd.drawText(cx, cy, "WAITING FOR TELEMETRY", RED + CENTER + BLINK)
    else
        drawRadar()
    end

    return 0
end

return nost
