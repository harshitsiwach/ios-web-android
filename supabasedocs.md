# Supabase SDK Integration with React Native Expo (iOS)

A comprehensive guide to integrating Supabase into your React Native Expo app, covering authentication, database operations, storage, realtime features, and edge functions.

## Overview

Supabase is an open-source Backend-as-a-Service (BaaS) built on PostgreSQL that provides authentication, realtime database, file storage, edge functions, and AI/vector capabilities. This guide covers complete integration with React Native Expo for iOS, including all API methods, hooks, and advanced features.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Project Configuration](#project-configuration)
3. [Authentication System](#authentication-system)
4. [Database Operations (CRUD)](#database-operations-crud)
5. [Realtime Subscriptions](#realtime-subscriptions)
6. [File Storage Management](#file-storage-management)
7. [Edge Functions](#edge-functions)
8. [Advanced Features](#advanced-features)
9. [Security & RLS](#security--rls)
10. [Performance Optimization](#performance-optimization)
11. [Troubleshooting](#troubleshooting)

---

## Installation & Setup

### Install Dependencies

```bash
# Core Supabase SDK
npx expo install @supabase/supabase-js

# Required dependencies for React Native
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-url-polyfill
npx expo install @rneui/themed  # Optional: for UI components

# Optional: For enhanced security with Expo SecureStore
npx expo install expo-secure-store aes-js react-native-get-random-values

# Optional: For image uploads
npx expo install expo-image-picker
```

### Polyfills Setup

Add to your app's entry point (`App.js` or `index.js`):

```javascript
import 'react-native-url-polyfill/auto';
```

### Initialize Supabase Client

Create `lib/supabase.js`:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform, AppState } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public'  // Default schema
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' }
  }
});

// Auto-refresh tokens when app becomes active
if (Platform.OS !== "web") {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
```

### Enhanced Security Setup (Optional)

For production apps requiring encryption:

```javascript
import * as SecureStore from 'expo-secure-store';
import * as aesjs from 'aes-js';
import 'react-native-get-random-values';

class LargeSecureStore {
  private async _encrypt(key: string, value: string) {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey));
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async _decrypt(key: string, value: string) {
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) return encryptionKeyHex;

    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex), 
      new aesjs.Counter(1)
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string) {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return encrypted;
    return await this._decrypt(key, encrypted);
  }

  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }

  async setItem(key: string, value: string) {
    const encrypted = await this._encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }
}

// Use encrypted storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new LargeSecureStore(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## Project Configuration

### Create Supabase Project

1. Go to [database.new](https://database.new)
2. Create a new project
3. Get your Project URL and API keys from Settings > API

### Database Schema Setup

```sql
-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username TEXT,
  website TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
CREATE POLICY "Users can view own profile." ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## Authentication System

### Basic Auth Methods

```javascript
// Sign up with email/password
const signUpWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

// Sign in with email/password
const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// Sign out
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current session
const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Get current user
const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};
```

### Social Authentication

```javascript
// Sign in with Apple
const signInWithApple = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: 'your-app-scheme://auth-callback'
    }
  });
  return { data, error };
};

// Sign in with Google
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'your-app-scheme://auth-callback'
    }
  });
  return { data, error };
};
```

### Magic Link & OTP Authentication

```javascript
// Send magic link
const sendMagicLink = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    }
  });
  return { data, error };
};

// Send SMS OTP
const sendSMSOTP = async (phone) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
  });
  return { data, error };
};

// Verify OTP
const verifyOTP = async (phone, token) => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  });
  return { data, error };
};
```

### Password Management

```javascript
// Reset password
const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'your-app-scheme://reset-password',
  });
  return { data, error };
};

// Update password
const updatePassword = async (password) => {
  const { data, error } = await supabase.auth.updateUser({
    password: password
  });
  return { data, error };
};

// Update email
const updateEmail = async (email) => {
  const { data, error } = await supabase.auth.updateUser({
    email: email
  });
  return { data, error };
};
```

### Auth State Management Hook

```javascript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, loading };
};
```

---

## Database Operations (CRUD)

### Read Operations (SELECT)

```javascript
// Fetch all records
const fetchAllCountries = async () => {
  const { data, error } = await supabase
    .from('countries')
    .select('*');
  return { data, error };
};

// Fetch with specific columns
const fetchCountryNames = async () => {
  const { data, error } = await supabase
    .from('countries')
    .select('name, capital, population');
  return { data, error };
};

// Fetch with filtering
const fetchEuropeanCountries = async () => {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('continent', 'Europe');
  return { data, error };
};

// Fetch with multiple filters
const fetchLargeEuropeanCountries = async () => {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('continent', 'Europe')
    .gt('population', 10000000);
  return { data, error };
};

// Fetch with ordering and limiting
const fetchTopCountries = async () => {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('population', { ascending: false })
    .limit(10);
  return { data, error };
};

// Fetch with joins (related tables)
const fetchCountriesWithCities = async () => {
  const { data, error } = await supabase
    .from('countries')
    .select(`
      name,
      cities (
        name,
        population
      )
    `);
  return { data, error };
};

// Fetch single record
const fetchCountryById = async (id) => {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};
```

### Advanced Query Filters

```javascript
// Text search
const searchCountries = async (searchTerm) => {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .textSearch('name', searchTerm);
  return { data, error };
};

// Range queries
const fetchCountriesInRange = async (minPop, maxPop) => {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .gte('population', minPop)
    .lte('population', maxPop);
  return { data, error };
};

// Array contains
const fetchCountriesWithLanguages = async (languages) => {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .contains('languages', languages);
  return { data, error };
};

// JSON operations
const fetchCountriesWithCapitalInfo = async () => {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('capital_info->population', '5000000');
  return { data, error };
};
```

### Create Operations (INSERT)

```javascript
// Insert single record
const createCountry = async (countryData) => {
  const { data, error } = await supabase
    .from('countries')
    .insert(countryData)
    .select();
  return { data, error };
};

// Insert multiple records
const createCountries = async (countriesData) => {
  const { data, error } = await supabase
    .from('countries')
    .insert(countriesData)
    .select();
  return { data, error };
};

// Insert with conflict resolution (upsert)
const upsertCountry = async (countryData) => {
  const { data, error } = await supabase
    .from('countries')
    .upsert(countryData, {
      onConflict: 'name'
    })
    .select();
  return { data, error };
};
```

### Update Operations (UPDATE)

```javascript
// Update single record
const updateCountry = async (id, updates) => {
  const { data, error } = await supabase
    .from('countries')
    .update(updates)
    .eq('id', id)
    .select();
  return { data, error };
};

// Update multiple records
const updateEuropeanCountries = async (updates) => {
  const { data, error } = await supabase
    .from('countries')
    .update(updates)
    .eq('continent', 'Europe')
    .select();
  return { data, error };
};

// Update JSON fields
const updateCountryInfo = async (id, infoUpdates) => {
  const { data, error } = await supabase
    .from('countries')
    .update({
      info: infoUpdates
    })
    .eq('id', id)
    .select();
  return { data, error };
};
```

### Delete Operations (DELETE)

```javascript
// Delete single record
const deleteCountry = async (id) => {
  const { data, error } = await supabase
    .from('countries')
    .delete()
    .eq('id', id);
  return { data, error };
};

// Delete multiple records
const deleteSmallCountries = async () => {
  const { data, error } = await supabase
    .from('countries')
    .delete()
    .lt('population', 100000);
  return { data, error };
};
```

### Database Functions & RPC

```javascript
// Call stored procedure
const callDatabaseFunction = async (functionName, params) => {
  const { data, error } = await supabase
    .rpc(functionName, params);
  return { data, error };
};

// Example: Get countries near a point
const getCountriesNearPoint = async (lat, lng, radiusKm) => {
  const { data, error } = await supabase
    .rpc('countries_near_point', {
      latitude: lat,
      longitude: lng,
      radius_km: radiusKm
    });
  return { data, error };
};
```

---

## Realtime Subscriptions

### Database Changes Subscription

```javascript
import { useState, useEffect } from 'react';

export const useRealtimeCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial data fetch
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*');
      
      if (data) {
        setCountries(data);
      }
      setLoading(false);
    };

    fetchInitialData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('countries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'countries'
        },
        (payload) => {
          console.log('Change received!', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setCountries(prev => [...prev, payload.new]);
              break;
              
            case 'UPDATE':
              setCountries(prev => 
                prev.map(item => 
                  item.id === payload.new.id ? payload.new : item
                )
              );
              break;
              
            case 'DELETE':
              setCountries(prev => 
                prev.filter(item => item.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { countries, loading };
};
```

### Specific Event Subscriptions

```javascript
// Listen to INSERT events only
const subscribeToInserts = () => {
  const channel = supabase
    .channel('insert-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'countries'
      },
      (payload) => {
        console.log('New country added:', payload.new);
      }
    )
    .subscribe();

  return channel;
};

// Listen to UPDATE events only
const subscribeToUpdates = () => {
  const channel = supabase
    .channel('update-channel')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'countries'
      },
      (payload) => {
        console.log('Country updated:', payload.new);
      }
    )
    .subscribe();

  return channel;
};

// Listen to specific column changes
const subscribeToPopulationChanges = () => {
  const channel = supabase
    .channel('population-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'countries',
        filter: 'population=neq.null'
      },
      (payload) => {
        console.log('Population changed:', payload.new);
      }
    )
    .subscribe();

  return channel;
};
```

### Broadcast & Presence

```javascript
// Broadcast messages to other clients
const sendBroadcastMessage = async (message) => {
  const channel = supabase.channel('room1');
  
  await channel.send({
    type: 'broadcast',
    event: 'message',
    payload: { message }
  });
};

// Track user presence
const trackPresence = async (userInfo) => {
  const channel = supabase.channel('room1');
  
  await channel.track(userInfo);
};

// Listen to presence changes
const subscribeToPresence = () => {
  const channel = supabase.channel('room1')
    .on('presence', { event: 'sync' }, () => {
      const newState = channel.presenceState();
      console.log('Presence state:', newState);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe();

  return channel;
};
```

---

## File Storage Management

### Upload Files

```javascript
import * as ImagePicker from 'expo-image-picker';

// Standard upload (< 6MB)
const uploadFile = async (bucket, filePath, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  return { data, error };
};

// Upload with overwrite
const uploadFileWithOverwrite = async (bucket, filePath, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true  // Overwrite existing file
    });
  return { data, error };
};

// Upload from image picker
const uploadImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const image = result.assets[0];
      
      // Convert image to blob
      const response = await fetch(image.uri);
      const blob = await response.blob();
      
      // Generate unique filename
      const fileExt = image.uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: image.type || 'image/jpeg'
        });
        
      return { data, error };
    }
  } catch (error) {
    return { data: null, error };
  }
};
```

### Resumable Uploads (TUS Protocol)

```javascript
import * as tus from 'tus-js-client';

const resumableUpload = (file, onProgress, onSuccess, onError) => {
  const upload = new tus.Upload(file, {
    endpoint: `https://your-project-id.supabase.co/storage/v1/upload/resumable`,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    headers: {
      authorization: `Bearer ${session.access_token}`,
      'x-upsert': 'true'
    },
    uploadDataDuringCreation: true,
    removeFingerprintOnSuccess: true,
    metadata: {
      bucketName: 'bucket_name',
      objectName: 'folder/file.pdf',
      contentType: 'application/pdf'
    },
    onError: onError,
    onProgress: onProgress,
    onSuccess: onSuccess
  });

  upload.findPreviousUploads().then((previousUploads) => {
    if (previousUploads.length) {
      upload.resumeFromPreviousUpload(previousUploads[0]);
    }
    upload.start();
  });

  return upload;
};
```

### Download Files

```javascript
// Download file as blob
const downloadFile = async (bucket, filePath) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(filePath);
  return { data, error };
};

// Get public URL for public buckets
const getPublicUrl = (bucket, filePath) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  return data.publicUrl;
};

// Create signed URL for private buckets
const createSignedUrl = async (bucket, filePath, expiresIn = 3600) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);
  return { data, error };
};

// Create signed URLs for multiple files
const createSignedUrls = async (bucket, filePaths, expiresIn = 3600) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(filePaths, expiresIn);
  return { data, error };
};
```

### File Management

```javascript
// List files in bucket
const listFiles = async (bucket, folder = '') => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    });
  return { data, error };
};

// Move file
const moveFile = async (bucket, fromPath, toPath) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .move(fromPath, toPath);
  return { data, error };
};

// Copy file
const copyFile = async (bucket, fromPath, toPath) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .copy(fromPath, toPath);
  return { data, error };
};

// Delete file
const deleteFile = async (bucket, filePaths) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove(filePaths);
  return { data, error };
};

// Get file metadata
const getFileMetadata = async (bucket, filePath) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list('', {
      search: filePath
    });
  return { data, error };
};
```

### Bucket Management

```javascript
// Create bucket
const createBucket = async (bucketName, options = {}) => {
  const { data, error } = await supabase.storage
    .createBucket(bucketName, {
      public: false,
      allowedMimeTypes: ['image/png', 'image/jpeg'],
      fileSizeLimit: 1024 * 1024 * 10, // 10MB
      ...options
    });
  return { data, error };
};

// List buckets
const listBuckets = async () => {
  const { data, error } = await supabase.storage.listBuckets();
  return { data, error };
};

// Get bucket details
const getBucket = async (bucketName) => {
  const { data, error } = await supabase.storage.getBucket(bucketName);
  return { data, error };
};

// Delete bucket
const deleteBucket = async (bucketName) => {
  const { data, error } = await supabase.storage.deleteBucket(bucketName);
  return { data, error };
};
```

---

## Edge Functions

### Invoking Edge Functions

```javascript
// Invoke edge function
const invokeEdgeFunction = async (functionName, payload = {}) => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return { data, error };
};

// Invoke with authentication
const invokeAuthenticatedFunction = async (functionName, payload = {}) => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    }
  });
  return { data, error };
};

// Invoke with custom headers
const invokeWithCustomHeaders = async (functionName, payload, customHeaders) => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders
    }
  });
  return { data, error };
};
```

### Common Edge Function Use Cases

```javascript
// Send email via edge function
const sendEmail = async (to, subject, body) => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to,
      subject,
      body
    }
  });
  return { data, error };
};

// Process image via edge function
const processImage = async (imageUrl, transformations) => {
  const { data, error } = await supabase.functions.invoke('process-image', {
    body: {
      imageUrl,
      transformations
    }
  });
  return { data, error };
};

// Generate PDF via edge function
const generatePDF = async (htmlContent) => {
  const { data, error } = await supabase.functions.invoke('generate-pdf', {
    body: {
      html: htmlContent
    }
  });
  return { data, error };
};

// Webhook handler
const processWebhook = async (webhookData) => {
  const { data, error } = await supabase.functions.invoke('webhook-handler', {
    body: webhookData
  });
  return { data, error };
};
```

---

## Advanced Features

### Custom Hooks for Common Operations

```javascript
// Generic CRUD hook
export const useSupabaseCRUD = (tableName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = async (filters = {}) => {
    setLoading(true);
    let query = supabase.from(tableName).select('*');
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: result, error } = await query;
    setData(result || []);
    setError(error);
    setLoading(false);
  };

  const create = async (item) => {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(item)
      .select();
    
    if (!error && result) {
      setData(prev => [...prev, ...result]);
    }
    return { data: result, error };
  };

  const update = async (id, updates) => {
    const { data: result, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (!error && result) {
      setData(prev => prev.map(item => 
        item.id === id ? result[0] : item
      ));
    }
    return { data: result, error };
  };

  const remove = async (id) => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (!error) {
      setData(prev => prev.filter(item => item.id !== id));
    }
    return { error };
  };

  return {
    data,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove
  };
};
```

### Pagination Hook

```javascript
export const useSupabasePagination = (tableName, pageSize = 10) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchPage = async (page = 0, filters = {}) => {
    setLoading(true);
    
    let query = supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: result, error, count } = await query;
    
    if (!error) {
      if (page === 0) {
        setData(result || []);
      } else {
        setData(prev => [...prev, ...(result || [])]);
      }
      setCurrentPage(page);
      setTotal(count || 0);
      setHasMore((page + 1) * pageSize < (count || 0));
    }
    
    setLoading(false);
    return { data: result, error };
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPage(currentPage + 1);
    }
  };

  const refresh = () => {
    fetchPage(0);
  };

  return {
    data,
    currentPage,
    loading,
    hasMore,
    total,
    fetchPage,
    loadMore,
    refresh
  };
};
```

---

## Security & Row Level Security (RLS)

### Enable RLS

```sql
-- Enable RLS on table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Custom Security Functions

```javascript
// Check if user owns resource
const checkOwnership = async (tableName, resourceId) => {
  const { data, error } = await supabase
    .from(tableName)
    .select('user_id')
    .eq('id', resourceId)
    .single();

  if (error) return false;
  
  const { data: { user } } = await supabase.auth.getUser();
  return data.user_id === user?.id;
};

// Secure operation wrapper
const secureOperation = async (operation, resourceCheck = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: { message: 'Unauthorized' } };
  }

  if (resourceCheck && !await resourceCheck()) {
    return { data: null, error: { message: 'Forbidden' } };
  }

  return await operation();
};
```

---

## Performance Optimization

### Caching Strategies

```javascript
// Simple in-memory cache
const cache = new Map();

const cachedQuery = async (cacheKey, queryFunction, ttl = 300000) => {
  const now = Date.now();
  const cached = cache.get(cacheKey);
  
  if (cached && (now - cached.timestamp) < ttl) {
    return { data: cached.data, error: null, fromCache: true };
  }

  const result = await queryFunction();
  
  if (!result.error) {
    cache.set(cacheKey, {
      data: result.data,
      timestamp: now
    });
  }

  return result;
};

// Usage
const fetchCachedCountries = () => 
  cachedQuery('countries', () => 
    supabase.from('countries').select('*')
  );
```

### Connection Optimization

```javascript
// Single connection instance
let supabaseInstance = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      // Optimize for mobile
      global: {
        fetch: (...args) => fetch(...args),
      },
      db: {
        schema: 'public'
      },
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
  }
  return supabaseInstance;
};
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. URL Polyfill Issues
```javascript
// Add at the top of your main App.js
import 'react-native-url-polyfill/auto';
```

#### 2. AsyncStorage Not Working
```javascript
// Ensure proper import and installation
import AsyncStorage from '@react-native-async-storage/async-storage';
```

#### 3. Realtime Connection Issues
```javascript
// Implement connection retry
const createChannelWithRetry = (channelName, retries = 3) => {
  const attempt = (retriesLeft) => {
    const channel = supabase.channel(channelName);
    
    channel.subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR' && retriesLeft > 0) {
        console.log('Channel error, retrying...', retriesLeft);
        setTimeout(() => {
          channel.unsubscribe();
          attempt(retriesLeft - 1);
        }, 1000);
      } else if (status === 'SUBSCRIBED') {
        console.log('Channel subscribed successfully');
      }
    });
    
    return channel;
  };
  
  return attempt(retries);
};
```

#### 4. File Upload Issues
```javascript
// Handle large files with progress
const uploadLargeFile = async (file, onProgress) => {
  const fileExt = file.uri.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type,
    name: fileName,
  });

  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/object/bucket_name/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    return await response.json();
  } catch (error) {
    return { error };
  }
};
```

### Performance Monitoring

```javascript
// Add performance monitoring
const monitoredQuery = async (queryName, queryFunction) => {
  const startTime = Date.now();
  
  try {
    const result = await queryFunction();
    const duration = Date.now() - startTime;
    
    console.log(`Query ${queryName} completed in ${duration}ms`);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Query ${queryName} failed after ${duration}ms:`, error);
    throw error;
  }
};
```

This comprehensive guide covers all aspects of Supabase integration with React Native Expo for iOS, providing you with everything needed to build production-ready applications with authentication, real-time features, file storage, and more.