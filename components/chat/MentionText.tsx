import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, textPresets } from '@theme/index';
import { MentionData } from 'schemas';

/**
 * Înlocuiește markerii [project:uuid] cu @NumeProiect pentru preview text simplu
 * (folosit în lista de conversații, notificări etc.)
 */
export const formatMentionPreview = (text: string, mentions: MentionData[]): string => {
  if (!text || !mentions || mentions.length === 0) return text;

  const mentionMap = new Map<string, string>();
  mentions.forEach((m) => mentionMap.set(m.id, m.name));

  return text.replace(/\[project:([a-f0-9-]{36})\]/g, (_full, id) => {
    const name = mentionMap.get(id);
    return name ? `@${name}` : '@Proiect';
  });
};

interface MentionTextProps {
  text: string;
  mentions: MentionData[];
  isOwn: boolean;
}

// Parsează textul și separă segmentele normale de markere [project:uuid]
const MENTION_REGEX = /\[project:([a-f0-9-]{36})\]/g;

export const MentionText: React.FC<MentionTextProps> = ({ text, mentions, isOwn }) => {
  const router = useRouter();

  if (!text) return null;

  // Dacă nu există mentions sau nu există markere, afișăm textul simplu
  if (!mentions || mentions.length === 0 || !text.includes('[project:')) {
    return (
      <Text style={[textPresets.bodyMedium, { color: colors.text.primary }]}>
        {text}
      </Text>
    );
  }

  // Construim un map id -> mention pentru lookup rapid
  const mentionMap = new Map<string, MentionData>();
  mentions.forEach((m) => mentionMap.set(m.id, m));

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  MENTION_REGEX.lastIndex = 0;
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    const [fullMatch, projectId] = match;
    const start = match.index;

    // Text înainte de marker
    if (start > lastIndex) {
      parts.push(
        <Text key={`text-${lastIndex}`} style={[textPresets.bodyMedium, { color: colors.text.primary }]}>
          {text.slice(lastIndex, start)}
        </Text>,
      );
    }

    // Marker-ul — înlocuit cu text clicabil
    const mention = mentionMap.get(projectId);
    const displayName = mention ? `@${mention.name}` : `@Proiect`;

    parts.push(
      <Text
        key={`mention-${projectId}-${start}`}
        style={[textPresets.bodyMedium, styles.mention, isOwn && styles.mentionOwn]}
        onPress={() => {
          router.push({ pathname: '/(tabs)/(conversations)/project/[id]', params: { id: projectId } } as any);
        }}
      >
        {displayName}
      </Text>,
    );

    lastIndex = start + fullMatch.length;
  }

  // Text rămas după ultimul marker
  if (lastIndex < text.length) {
    parts.push(
      <Text key={`text-end`} style={[textPresets.bodyMedium, { color: colors.text.primary }]}>
        {text.slice(lastIndex)}
      </Text>,
    );
  }

  return <Text>{parts}</Text>;
};

const styles = StyleSheet.create({
  mention: {
    color: colors.mediumBlue,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  mentionOwn: {
    color: colors.darkBlue,
  },
});
