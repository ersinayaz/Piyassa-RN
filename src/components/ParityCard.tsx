import { useStore } from '../store';
import { color } from '../assets/colors';
import React, { useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const ParityCard = ({ navigation, data }) => {

    return (
        <TouchableOpacity style={styles.container}>
            <View>
                <Image style={styles.image} source={data.image} />
            </View>
            <View style={styles.center}>
                <Text style={styles.title}>{data.name}</Text>
                <Text style={styles.description}>{data.description}</Text>
            </View>
            <View style={styles.right}>
                <Text>{data.closingPrice}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default ParityCard;

const styles = StyleSheet.create({
    container: {
        height: 73.5,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    center: {
        flex: 1,
        marginLeft: 20
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    title: {
        fontSize: 17,
        fontWeight: 'bold',
        color: color("color8"),
    },
    description: {
        fontSize: 12,
        color: color("color7"),
    },
});