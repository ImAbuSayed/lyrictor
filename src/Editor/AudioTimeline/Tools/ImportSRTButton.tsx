import { Button, Dialog, DialogTrigger, TextArea, Text, Content, Heading, Divider } from "@adobe/react-spectrum";
import { useState } from "react";
import { useProjectStore } from "../../../Project/store";
import { LyricText } from "../../types";
import { parseSRT } from "../../../utils/srtParser";
import { RGBColor } from "react-color";

// Helper function to calculate timeline level for overlapping lyrics
function getNewTextLevel(start: number, end: number, lyricTexts: LyricText[]) {
  const overlappingLyricTexts = lyricTexts.filter((lyricText) => {
    return (
      (lyricText.start >= start && lyricText.start < end) ||
      (lyricText.end > start && lyricText.end <= end) ||
      (lyricText.start <= start && lyricText.end >= end)
    );
  });

  if (overlappingLyricTexts.length === 0) return 1;
  
  const maxLevel = Math.max(
    ...overlappingLyricTexts.map((lyricText) => lyricText.textBoxTimelineLevel || 1)
  );
  
  return maxLevel + 1;
}

interface VisualizerSetting {
  // Add appropriate properties based on your application's needs
  type: string;
  color: RGBColor;
  // Add other properties as needed
}

export default function ImportSRTButton() {
  const [srtText, setSrtText] = useState("");
  const addNewLyricText = useProjectStore((state: any) => state.addNewLyricText);
  const [isOpen, setIsOpen] = useState(false);

  const handleImport = () => {
    try {
      const subtitles = parseSRT(srtText);
      const store = useProjectStore.getState();
      
      // Create all lyrics first with initial level 1
      const newLyricTexts = [...store.lyricTexts];
      
      subtitles.forEach((subtitle) => {
        const lyricId = Date.now() + Math.random(); // Generate a unique ID
        newLyricTexts.push({
          id: lyricId,
          start: subtitle.start,
          end: subtitle.end,
          text: subtitle.text,
          textY: 0.5,
          textX: 0.5,
          textBoxTimelineLevel: 1, // Will be updated below
          isImage: false,
          isVisualizer: false,
          fontName: "Inter Variable",
          fontWeight: 400,
        });
      });
      
      // Sort by start time
      newLyricTexts.sort((a, b) => a.start - b.start);
      
      // Update timeline levels to prevent overlap
      newLyricTexts.forEach((lyric, index) => {
        lyric.textBoxTimelineLevel = getNewTextLevel(
          lyric.start, 
          lyric.end, 
          newLyricTexts.filter((_, i) => i !== index)
        );
      });
      
      // Update the store with all lyrics at once
      store.updateLyricTexts(newLyricTexts);
      
      // Close the dialog and reset the text area
      setIsOpen(false);
      setSrtText("");
    } catch (error) {
      console.error("Error parsing SRT:", error);
      alert("Failed to parse SRT. Please check the format and try again.");
    }
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button variant="secondary" marginX="size-100">
        Import SRT
      </Button>
      {(close: () => void) => (
        <Dialog>
          <Heading>Import SRT Subtitles</Heading>
          <Divider />
          <Content>
            <Text>Paste your SRT formatted subtitles below:</Text>
            <TextArea
              value={srtText}
              onChange={setSrtText}
              width="100%"
              height="size-2400"
              marginY="size-200"
              placeholder={`1\n00:00:11,808 --> 00:00:17,792\nYour lyrics here...`}
            />
            <div style={{ marginTop: '16px' }}>
              <Text>Format example:</Text>
              <pre style={{
                backgroundColor: '#2a2a2a',
                padding: '8px',
                borderRadius: '4px',
                marginTop: '8px',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                color: '#ccc'
              }}>
{`1
00:00:11,808 --> 00:00:17,792
ये वहम है मेरा, या साया तेरा,

2
00:00:17,553 --> 00:00:23,776
जो हर रात मुझसे, मिलने आता है।`}
              </pre>
            </div>
          </Content>
          <ButtonGroup>
            <Button variant="secondary" onPress={close}>
              Cancel
            </Button>
            <Button 
              variant="cta" 
              onPress={handleImport}
              isDisabled={!srtText.trim()}
            >
              Import
            </Button>
          </ButtonGroup>
        </Dialog>
      )}
    </DialogTrigger>
  );
}

// Need to define ButtonGroup as it's not directly exported from @adobe/react-spectrum
function ButtonGroup({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      marginTop: '16px',
      justifyContent: 'flex-end',
      gap: '8px'
    }}>
      {children}
    </div>
  );
}
