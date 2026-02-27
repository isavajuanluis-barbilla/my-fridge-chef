import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Colors from '@/constants/Colors';

interface ResultCardProps {
  text: string;
  onSendSMS?: (shopList: string) => void;
}

// Simple markdown-like renderer
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // H1 - ##
    if (line.startsWith('## ')) {
      return (
        <Text key={i} style={styles.h2}>
          {line.replace('## ', '')}
        </Text>
      );
    }
    // H2 - ###
    if (line.startsWith('### ')) {
      return (
        <Text key={i} style={styles.h3}>
          {line.replace('### ', '')}
        </Text>
      );
    }
    // Bold **text**
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <Text key={i} style={styles.bold}>
          {line.replace(/\*\*/g, '')}
        </Text>
      );
    }
    // Bullet list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>{parseBold(line.substring(2))}</Text>
        </View>
      );
    }
    // Numbered list
    if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.+)/);
      if (match) {
        return (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bullet}>{match[1]}.</Text>
            <Text style={styles.bulletText}>{parseBold(match[2])}</Text>
          </View>
        );
      }
    }
    // Empty line = spacer
    if (line.trim() === '') {
      return <View key={i} style={{ height: 6 }} />;
    }
    // Regular text
    return (
      <Text key={i} style={styles.body}>
        {parseBold(line)}
      </Text>
    );
  });
}

function parseBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <Text key={i} style={styles.inlineBold}>
        {part}
      </Text>
    ) : (
      part
    )
  );
}

export function ResultCard({ text, onSendSMS }: ResultCardProps) {
  const hasShoppingList = text.toUpperCase().includes('SHOPPING LIST');
  const shopList = hasShoppingList
    ? text.split(/SHOPPING LIST/i).pop()?.replace(/[*#]/g, '').trim() || ''
    : '';

  const handleSMS = () => {
    if (onSendSMS) {
      onSendSMS(shopList);
    } else {
      const encoded = encodeURIComponent(`Shopping List:\n${shopList}`);
      Linking.openURL(`sms:?&body=${encoded}`);
    }
  };

  return (
    <View style={styles.card}>
      <ScrollView
        style={styles.scroll}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {renderMarkdown(text)}
      </ScrollView>

      {hasShoppingList && (
        <TouchableOpacity style={styles.smsButton} onPress={handleSMS}>
          <Text style={styles.smsText}>📲 Send Shopping List via SMS</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  scroll: {
    maxHeight: 420,
  },
  h2: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 10,
    marginBottom: 4,
  },
  h3: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.secondary,
    marginTop: 8,
    marginBottom: 2,
  },
  bold: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginVertical: 2,
  },
  inlineBold: {
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 1,
    paddingLeft: 8,
    gap: 6,
  },
  bullet: {
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 22,
    width: 14,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  smsButton: {
    marginTop: 12,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  smsText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
});
