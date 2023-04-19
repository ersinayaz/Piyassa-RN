import { useStore } from '../store';
import { color } from '../assets/colors';
import ParityCard from '../components/ParityCard';
import { View, StyleSheet, FlatList } from 'react-native';

const HomeScreen = ({ navigation }) => {
    const { deviceStore } = useStore();

    return (
        <>
            <View style={styles.background}>
                <View style={styles.container}>
                    <FlatList
                        style={styles.flatlist}
                        data={deviceStore.parities}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        ListFooterComponent={() => (<View style={{ height: 5 }} />)}
                        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                        renderItem={(data) => <ParityCard data={data.item} navigation={navigation} />}
                    />
                </View>
            </View>
        </>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: color("color2"),
    },
    container: {
        flex: 1,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: color("color6"),
    },
    flatlist: {
        flex: 1,
        marginTop: 5
    },
    itemSeparator: {
        height: .7,
        backgroundColor: color("color5"),
    },
});