import { useTheme } from '@/contexts/ThemeContext';
import { useWallet } from '@/hooks/use-wallet';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

// Define the contest data structure
type Contest = {
  id: number;
  name: string;
  prizePool: string;
  maxTeams: number;
  currentTeams: number;
  entryFee: string;
  endsAt: number; // Unix timestamp
};

const ContestSelectionScreen = () => {
  const { colors } = useTheme();
  const { address, isConnected } = useWallet();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch active contests (sample data for now)
  const fetchActiveContests = async () => {
    try {
      // In a real implementation, this would fetch from the smart contract
      // For now, we'll use sample data
      const sampleContests: Contest[] = [
        {
          id: 1,
          name: 'Weekly Crypto Challenge',
          prizePool: '1000',
          maxTeams: 100,
          currentTeams: 75,
          entryFee: '10',
          endsAt: Date.now() + 86400000, // 24 hours from now
        },
        {
          id: 2,
          name: 'Monthly Master League',
          prizePool: '5000',
          maxTeams: 500,
          currentTeams: 320,
          entryFee: '25',
          endsAt: Date.now() + 2592000000, // 30 days from now
        },
        {
          id: 3,
          name: 'Daily Quick Draw',
          prizePool: '100',
          maxTeams: 50,
          currentTeams: 30,
          entryFee: '5',
          endsAt: Date.now() + 3600000, // 1 hour from now
        },
      ];
      
      setContests(sampleContests);
    } catch (error) {
      console.error('Error fetching active contests:', error);
      Alert.alert('Error', 'Failed to fetch active contests. Using sample data.');
      
      // Using sample data in case of error
      setContests([
        {
          id: 1,
          name: 'Weekly Crypto Challenge',
          prizePool: '1000',
          maxTeams: 100,
          currentTeams: 75,
          entryFee: '10',
          endsAt: Date.now() + 86400000, // 24 hours from now
        },
        {
          id: 2,
          name: 'Monthly Master League',
          prizePool: '5000',
          maxTeams: 500,
          currentTeams: 320,
          entryFee: '25',
          endsAt: Date.now() + 2592000000, // 30 days from now
        },
        {
          id: 3,
          name: 'Daily Quick Draw',
          prizePool: '100',
          maxTeams: 50,
          currentTeams: 30,
          entryFee: '5',
          endsAt: Date.now() + 3600000, // 1 hour from now
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveContests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActiveContests();
  };

  const selectContest = (contestId: number) => {
    // In a real implementation, we would submit the team to the selected contest
    Alert.alert(
      'Confirm Submission',
      `Submit your team to ${contests.find(c => c.id === contestId)?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          onPress: () => {
            Alert.alert(
              'Team Submitted!',
              `Your team has been submitted to contest #${contestId}.`,
              [{ text: 'OK' }]
            );
            // In a real implementation, this would call the submitTeam function
            // router.back(); // Go back to previous screen after submission
          }
        }
      ]
    );
  };

  const renderContestItem = ({ item }: { item: Contest }) => {
    const progress = (item.currentTeams / item.maxTeams) * 100;
    const isAlmostFull = progress > 70;
    
    return (
      <View style={[styles.contestItem, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }]}>
        <View style={styles.contestInfo}>
          <Text style={[styles.contestName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.prizePool, { color: colors.text }]}>Prize Pool: {item.prizePool} tokens</Text>
          <Text style={[styles.entryFee, { color: colors.textSecondary }]}>Entry Fee: {item.entryFee} tokens</Text>
          <View style={styles.participantsContainer}>
            <Text style={[styles.participants, { color: colors.textSecondary }]}>
              {item.currentTeams}/{item.maxTeams} teams
            </Text>
          </View>
        </View>
        
        <View style={styles.contestActions}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.textSecondary }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress}%`, 
                    backgroundColor: isAlmostFull ? colors.down : colors.up 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>{Math.round(progress)}%</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.selectButton, { backgroundColor: colors.primary }]}
            onPress={() => selectContest(item.id)}
          >
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading contests...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: 20, fontWeight: 'bold' }]}>Active Contests</Text>
        <Text style={[styles.contestCount, { color: colors.textSecondary }]}>{contests.length} contests available</Text>
      </View>
      
      <FlatList
        data={contests}
        renderItem={renderContestItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No active contests at the moment
          </Text>
        }
      />
    </View>
  );
};

export default ContestSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    marginBottom: 4,
  },
  contestCount: {
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  contestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  contestInfo: {
    flex: 1,
    marginRight: 12,
  },
  contestName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  prizePool: {
    fontSize: 14,
    marginBottom: 4,
  },
  entryFee: {
    fontSize: 12,
    marginBottom: 8,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participants: {
    fontSize: 12,
  },
  contestActions: {
    width: 120,
    alignItems: 'flex-end',
  },
  progressBarContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  progressBar: {
    width: 100,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
  },
  selectButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});