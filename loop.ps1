param(
    [int]$MaxIterations = 0,
    [int]$PauseSeconds = 5,
    [string]$Model = "claude-opus-4-6"
)

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$LogDir = Join-Path $ScriptDir "loop_logs"
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

$LoopStart = Get-Date
$Iteration = 0
$TotalInputTokens = 0
$TotalOutputTokens = 0
$TotalCacheRead = 0
$TotalCacheCreation = 0
$IterationStats = @()

Write-Host "=== Ralph Loop Starting ===" -ForegroundColor Cyan
Write-Host "Max iterations: $MaxIterations (0=infinite)"
Write-Host "Pause between iterations: ${PauseSeconds}s"
Write-Host "Model: $Model"
Write-Host ""

while ($true) {
    $Iteration++
    $IterStart = Get-Date

    Write-Host "--- Iteration $Iteration @ $IterStart ---" -ForegroundColor Yellow

    try {
        $PromptContent = Get-Content -Path (Join-Path $ScriptDir "PROMPT.md") -Raw
        $Output = $PromptContent | claude -p --dangerously-skip-permissions --model $Model --output-format stream-json --verbose 2>&1

        # Parse token usage from the stream-json output (in memory, no file)
        $IterInput = 0
        $IterOutput = 0
        $IterCacheRead = 0
        $IterCacheCreation = 0

        $Output | ForEach-Object {
            try {
                $line = $_ | ConvertFrom-Json -ErrorAction SilentlyContinue
                if ($line.type -eq "result" -and $line.usage) {
                    $IterInput = [int]($line.usage.input_tokens ?? 0)
                    $IterOutput = [int]($line.usage.output_tokens ?? 0)
                    $IterCacheRead = [int]($line.usage.cache_read_input_tokens ?? 0)
                    $IterCacheCreation = [int]($line.usage.cache_creation_input_tokens ?? 0)
                }
            } catch {}
        }

        $TotalInputTokens += $IterInput
        $TotalOutputTokens += $IterOutput
        $TotalCacheRead += $IterCacheRead
        $TotalCacheCreation += $IterCacheCreation

        $IterDuration = (Get-Date) - $IterStart

        # Track per-iteration stats for the summary
        $IterationStats += @{
            Iteration = $Iteration
            Start     = $IterStart
            Duration  = $IterDuration
            Input     = $IterInput
            Output    = $IterOutput
            CacheRead = $IterCacheRead
            CacheCreate = $IterCacheCreation
        }

        Write-Host "--- Iteration $Iteration completed in $($IterDuration.ToString('hh\:mm\:ss')) ---" -ForegroundColor Green
        Write-Host "    Tokens: input=$IterInput output=$IterOutput cache_read=$IterCacheRead cache_create=$IterCacheCreation" -ForegroundColor DarkCyan
    }
    catch {
        Write-Host "--- Iteration $Iteration exited with error (continuing) ---" -ForegroundColor Red
    }

    # Check if all tasks are complete
    $DoneFile = Join-Path $ScriptDir "LOOP_DONE"
    if (Test-Path $DoneFile) {
        $DoneContent = Get-Content $DoneFile -Raw
        if ($DoneContent -match "ALL_TASKS_COMPLETE") {
            Write-Host ""
            Write-Host "=== All tasks complete! Loop finished. ===" -ForegroundColor Green
            Remove-Item $DoneFile
            break
        }
    }

    if ($MaxIterations -gt 0 -and $Iteration -ge $MaxIterations) {
        Write-Host ""
        Write-Host "=== Reached max iterations ($MaxIterations), stopping ===" -ForegroundColor Cyan
        break
    }

    Write-Host "Pausing ${PauseSeconds}s (Ctrl+C to stop)..." -ForegroundColor DarkGray
    Start-Sleep -Seconds $PauseSeconds
}

# Final summary
$LoopEnd = Get-Date
$LoopDuration = $LoopEnd - $LoopStart

# Cost estimate (Opus 4.6 pricing as of 2025)
# Input: $5/MTok, Output: $25/MTok, Cache read: $0.50/MTok, Cache write: $6.25/MTok
$InputCost = ($TotalInputTokens / 1000000) * 5.0
$OutputCost = ($TotalOutputTokens / 1000000) * 25.0
$CacheReadCost = ($TotalCacheRead / 1000000) * 0.50
$CacheCreateCost = ($TotalCacheCreation / 1000000) * 6.25
$TotalCost = $InputCost + $OutputCost + $CacheReadCost + $CacheCreateCost

# Determine next run number
$ExistingRuns = Get-ChildItem -Path $LogDir -Filter "run-*.txt" -ErrorAction SilentlyContinue
$RunNumber = 1
if ($ExistingRuns) {
    $RunNumber = ($ExistingRuns | ForEach-Object {
        if ($_.BaseName -match 'run-(\d+)') { [int]$Matches[1] }
    } | Measure-Object -Maximum).Maximum + 1
}
$RunFile = Join-Path $LogDir "run-${RunNumber}.txt"

# Build per-iteration breakdown
$IterLines = ""
foreach ($s in $IterationStats) {
    $IterCost = (($s.Input / 1e6) * 5.0) + (($s.Output / 1e6) * 25.0) + (($s.CacheRead / 1e6) * 0.50) + (($s.CacheCreate / 1e6) * 6.25)
    $IterLines += "  #$($s.Iteration)  $($s.Duration.ToString('hh\:mm\:ss'))  in=$($s.Input.ToString('N0'))  out=$($s.Output.ToString('N0'))  ~`$$($IterCost.ToString('F2'))`n"
}

# Build summary content
$Summary = @"
Ralph Loop — Run #$RunNumber
========================================
Model:       $Model
Started:     $($LoopStart.ToString('yyyy-MM-dd HH:mm:ss'))
Ended:       $($LoopEnd.ToString('yyyy-MM-dd HH:mm:ss'))
Duration:    $($LoopDuration.ToString('hh\:mm\:ss'))
Iterations:  $Iteration

Tokens
  Input:          $($TotalInputTokens.ToString('N0'))
  Output:         $($TotalOutputTokens.ToString('N0'))
  Cache read:     $($TotalCacheRead.ToString('N0'))
  Cache create:   $($TotalCacheCreation.ToString('N0'))

Cost (estimated, Opus pricing)
  Input:          `$$($InputCost.ToString('F4'))
  Output:         `$$($OutputCost.ToString('F4'))
  Cache read:     `$$($CacheReadCost.ToString('F4'))
  Cache create:   `$$($CacheCreateCost.ToString('F4'))
  ─────────────────────
  Total:          `$$($TotalCost.ToString('F2'))

Iterations
$IterLines========================================
"@

# Write to file
$Summary | Out-File -FilePath $RunFile -Encoding utf8
Write-Host ""
Write-Host $Summary -ForegroundColor Cyan
Write-Host "  Summary: $RunFile" -ForegroundColor DarkGray
