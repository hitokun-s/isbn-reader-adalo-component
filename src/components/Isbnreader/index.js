import {Button, StyleSheet, Text, View} from 'react-native'
import React, {useEffect, useRef, useState} from 'react';

// see this: https://github.com/serratus/quaggaJS/issues/335
// import Quagga from 'quagga';
import Quagga from 'quagga/dist/quagga';
import {Dimensions} from "react-native-web";

const isbnreader = (props) => {

    const {color} = props

    const [text, setText] = useState(props.text);

    const [deviceIds, setDeviceIds] = useState([]);
    const [deviceId, setDeviceId] = useState(null);
    const [isStarted, setIsStarted] = useState(false);

    const {width, height} = Dimensions.get("window");

    const videoRef = useRef(null);

    useEffect(() => {
        if (!isStarted && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then(devices => {
                const deviceIds = devices.filter(d => d.kind === "videoinput").map(d => d.deviceId)
                setDeviceIds(deviceIds)
                setDeviceId(deviceIds[0])
            })
        }
    })

    const _onDetected = (results) => {
        console.log(results.find(v => v.codeResult?.code))
        const code = results.find(v => v.codeResult?.code?.startsWith("978"))
        if (code) {
            setText(code.codeResult.code)
        }
    }

    useEffect(() => {
        if (isStarted) {
            Quagga.stop();
        }
        Quagga.init({
            inputStream: {
                type: "LiveStream",
                constraints: {
                    width: 480,
                    height: 480,
                    // facing: "user" // or environment,
                    facingMode: undefined,
                    deviceId: deviceId
                }
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            decoder: {
                readers: [
                    // "code_128_reader",
                    "ean_reader"
                ],
                multiple: true
            },
            locate: true
        }, function (err) {
            if (err) {
                return console.log(err);
            }
            Quagga.start();
            setIsStarted(true);
        });
        Quagga.onDetected(_onDetected);
    }, [deviceId])

    const videoConstraints = {
        facingMode: {exact: "environment"}
    };

    const changeCameraType = () => {
        if (deviceIds.length < 2) {
            return
        }
        const curIdx = deviceIds.indexOf(deviceId)
        let nextIdx = (curIdx === deviceIds.length - 1) ? 0 : curIdx + 1
        setDeviceId(deviceIds[nextIdx])
    }

    const styles = StyleSheet.create({
        wrapper: {
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            flex: 1,
            flexDirection: 'column',
            position: 'relative'
        },
        capture: {
            backgroundColor: '#fff',
            borderRadius: 5,
            color: '#000',
            padding: 10,
            margin: 10,
            width: "100px",
            justifyContent: 'flex-end',
            // position: "absolute",
            zIndex: 100
        }
    })

    return (
        <View style={styles.wrapper}>
            <div id="interactive" className="viewport" style={{zIndex: 0}}>
            </div>
            <View style={{position: 'absolute', top: 0}}>
                <Button
                    style={styles.capture}
                    onPress={changeCameraType}
                    title="switch"
                />
            </View>
            <View style={{position: 'absolute', justifyContent: 'center', top: 200}}>
                <Text style={{zIndex: 100}}>{text}</Text>
            </View>
        </View>
    )
}

export default isbnreader
