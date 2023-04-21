import { useStore } from '../store';
import { useFirestore } from '../db';
import { color } from '../assets/colors';
import React, { useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface ParityPriceProps {
    data: any;
    navigation: any;
}

enum ChangeState {
    up = "up",
    down = "down",
    equal = "equal",
}

const ParityPrice = (props: ParityPriceProps) => {
    const { parities } = useFirestore();
    const calculateRate = (lastPrice) => {
        const changeRate = Math.abs(((props.data.closingPrice - lastPrice) / lastPrice) * 100).toFixed(2);
        const state = props.data.closingPrice < lastPrice ? ChangeState.up : props.data.closingPrice > lastPrice ? ChangeState.down : ChangeState.equal;
        const rate = lastPrice == props.data.closingPrice ? 0 : (changeRate === '0.00' ? '0.01' : changeRate);
        const style = state === ChangeState.up ? styles.up : state === ChangeState.down ? styles.down : styles.equal;

        return { rate, state, style };
    };

    const [data, setData] = useState(props.data);
    const [lastPrice, setLastPrice] = useState({ price: props.data.price, state: ChangeState.equal, style: styles.equal });
    const [changeRate, setChangeRate] = useState(calculateRate(props.data.price));


    useEffect(() => {
        const onPriceChange = (price) => {
            // console.log("onPriceChane", price);
            props.data.price = price;
            let state = ChangeState.equal;
            let style = styles.equal;
            if (price > lastPrice.price) {
                state = ChangeState.up;
                style = styles.up;
            } else if (price < lastPrice.price) {
                state = ChangeState.down;
                style = styles.down;
            }
            setLastPrice({ price, state, style });
            setChangeRate(calculateRate(price));
        }

        const onClosingPriceChange = (closingPrice) => {
            // console.log("onClosingPriceChange", closingPrice);
            props.data.closingPrice = closingPrice;
            setLastPrice({ price: closingPrice, state: ChangeState.equal, style: styles.equal });
            setChangeRate({ rate: 0, state: ChangeState.equal, style: styles.equal });
        }

        if (data.price !== lastPrice.price) {
            onPriceChange(data.price);
        }
        if (data.closingPrice !== props.data.closingPrice) {
            onClosingPriceChange(data.closingPrice);
        }
    }, [data]);


    useEffect(() => {
        const unsubscribe = parities.onChangeById(props.data.id, (data) => {
            setData(data);
        });

        return () => {
            try {
                unsubscribe();
            } catch { }
        };
    }, [props.data.id, parities]);



    return (
        <View style={styles.container}>
            <View style={styles.lastPrice}>
                {
                    lastPrice.state !== ChangeState.equal ?
                        <Ionicons name={`ios-caret-${lastPrice.state}`} size={14} style={lastPrice.style} />
                        : null
                }
                <Text style={[styles.price, lastPrice.style]}>{lastPrice.price.toFixed(4)}<Text style={[styles.priceChar, lastPrice.style]}>{props.data.priceChar}</Text></Text>
            </View>
            <View style={styles.changeRate}>
                <Text style={[styles.rate, changeRate.style]}>%{changeRate.rate}</Text>
                <Image style={styles.icon} source={require('../assets/images/general/24-hours.png')} />
            </View>
        </View>
    );
};

export default ParityPrice;

const styles = StyleSheet.create({
    container: {
    },
    lastPrice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    changeRate: {
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    icon: {
        width: 14,
        height: 14,
        marginLeft: 5,
    },
    rate: {
        fontSize: 10,
        fontWeight: '500'
    },
    price: {
        fontSize: 16,
        marginLeft: 5,
        fontWeight: 'bold'
    },
    priceChar: {
        fontSize: 12,
        fontWeight: '500',
    },
    up: {
        color: "#00B75F",
    },
    down: {
        color: "#D80027",
    },
    equal: {
        color: color("color7"),
    },
});
