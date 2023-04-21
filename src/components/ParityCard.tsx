import ParityPrice from './ParityPrice';
import { color } from '../assets/colors';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default ParityCard = ({ navigation, data }) => {
    return (
        <TouchableOpacity onPress={() => { navigation.navigate("ParityDetail", { navigation, data }) }} style={styles.container}>
            <Image style={styles.image} source={data.image} />
            <View style={styles.center}>
                <Text style={styles.title}>{data.name}</Text>
                <Text style={styles.description}>{data.description}</Text>
            </View>
            <View style={styles.right}>
                <ParityPrice data={data} navigarion={navigation} />
            </View>
        </TouchableOpacity>
    );
};

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