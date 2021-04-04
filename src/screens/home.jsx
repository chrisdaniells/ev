import React, { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text
} from 'react-native';

import {
    PostcodeApi,
    OpenChargeMapApi,
    EVEnergyApi
} from '../apis';

import PostcodeInput from '../components/postcodeInput';
import ResultList from '../components/resultList';


const styles = StyleSheet.create({
    container: {
        margin: 10
    }
});

export default function HomeScreen() {
    const [chargePointData, setChargePointData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedChargePointId, setSelectedChargePointId] = useState(null)

    function handlePostcodeInputButtonPress(postcode) {
        setIsLoading(true);

        PostcodeApi.fetchPostcodeCoords(postcode)
            .then(coords => {
                const { longitude, latitude } = coords;
                OpenChargeMapApi.fetchPublicChargers(longitude, latitude)
                    .then(data => {
                        setIsLoading(false);
                        setChargePointData(
                            data.map(item => ({
                                title: item.AddressInfo.Title,
                                town: item.AddressInfo.Town,
                                postcode: item.AddressInfo.Postcode,
                                distance: item.AddressInfo.Distance.toFixed(2),
                                chargerId: item.ID
                            }))
                        );
                    })
                    .catch(err => {
                        setIsLoading(false);
                        console.log(err);
                    });
            })
            .catch(error => {
                setIsLoading(false);
                console.log(error);
            });
    }

    function handleChargePointItemSelect(chargerId) {
        EVEnergyApi.startChargingSession(chargerId)
            .then(data => console.log(data))
            .catch(error => console.log(error))
            .finally(() => setSelectedChargePointId(chargerId));
    }

    return (
        <SafeAreaView style={styles.container}>
            <PostcodeInput onButtonPress={handlePostcodeInputButtonPress} />

            { isLoading &&
                <Text>Loading...</Text>
            }

            { chargePointData.length > 0 &&
                <ResultList
                    items={chargePointData}
                    onItemSelect={handleChargePointItemSelect}
                    selectedItemId={selectedChargePointId}
                />
            }
        </SafeAreaView>
    );
}
