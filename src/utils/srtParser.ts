/**
 * Converts SRT time format (HH:MM:SS,mmm) to seconds
 * @param timeString Time in SRT format (e.g., "00:01:23,456")
 * @returns Time in seconds (e.g., 83.456)
 */
function srtTimeToSeconds(timeString: string): number {
  const [hours, minutes, secondsMs] = timeString.split(':');
  const [seconds, milliseconds] = secondsMs.split(',');
  
  return (
    parseInt(hours) * 3600 +
    parseInt(minutes) * 60 +
    parseInt(seconds) +
    parseInt(milliseconds) / 1000
  );
}

/**
 * Parses SRT formatted text into an array of subtitle entries
 * @param srtText SRT formatted text
 * @returns Array of { start: number, end: number, text: string }
 */
export function parseSRT(srtText: string): Array<{start: number, end: number, text: string}> {
  // Split the SRT text into individual subtitle blocks
  const blocks = srtText.trim().split(/\n\s*\n/);
  
  return blocks.map(block => {
    const lines = block.split('\n');
    if (lines.length < 2) return null;
    
    // Extract timecodes from the second line (index 1)
    const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})/g);
    if (!timeMatch || timeMatch.length < 2) return null;
    
    const [startTime, endTime] = timeMatch;
    const text = lines.slice(2).join(' ').trim();
    
    return {
      start: srtTimeToSeconds(startTime),
      end: srtTimeToSeconds(endTime),
      text: text
    };
  }).filter(Boolean) as Array<{start: number, end: number, text: string}>;
}
