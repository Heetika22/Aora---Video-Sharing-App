import { Alert, FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import {images} from '../../constants'
import SearchInput from '../../components/SearchInput'
import EmptyState from '../../components/EmptyState'
import { fetchSavedVideos, getAllPosts, getLatestPosts } from '../../lib/appwrite'
import useAppwrite from '../../lib/useAppwrite'
import VideoCard from '../../components/VideoCard'
import { useGlobalContext } from '../../context/GlobalProvider'

const Saved = () => {
  const {user} = useGlobalContext();

  const {data: posts, refetch} = useAppwrite(() =>fetchSavedVideos(user.$id));
  //console.log(posts);

  const[refreshing, setRefreshing]= useState(false);
  const onRefresh= async () =>{
    setRefreshing(true);
    //re call videos if any new videos come
    await refetch();
    setRefreshing(false);
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <StatusBar backgroundColor='#161622' style="light"></StatusBar>
      <FlatList 
        data={posts}
        keyExtractor={(item)=>item.$id}
        renderItem={({item}) => (
            <VideoCard video={item} context="savedVideos"/>
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between flex-row items-start mb-6">
             <Text className="text-2xl text-white font-psemibold">Saved Videos</Text>
            </View>

            <SearchInput placeholder="Search your saved videos"/>

          </View>
        )}

        ListEmptyComponent={() => (
          <EmptyState title="No Saved Videos" subtitle="Save your favourite videos now.." />
        )}

        refreshControl={<RefreshControl refreshing= {refreshing} onRefresh={onRefresh}/>}
      />
    </SafeAreaView>
  )
}

export default Saved

const styles = StyleSheet.create({})