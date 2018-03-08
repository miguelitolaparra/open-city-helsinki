package nativemodules;

import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import services.HostCardEmulationService;

/**
 * Created by niko on 7.3.2018.
 */

public class RNHostCardEmulationManager extends ReactContextBaseJavaModule {
    private static final String NAME = "HostCardManager";
    private static final String CARD_NUMBER = "cardNumber";
    private static final String CARD_PIN = "cardPin";

    public RNHostCardEmulationManager(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return RNHostCardEmulationManager.NAME;
    }

    private SharedPreferences getPreferences() {
        //TODO Check mode
        return getReactApplicationContext().getSharedPreferences("local_storage", 0);
    }

    @ReactMethod
    public void setCardInfo(ReadableMap map, final Promise promise) {
        CardInfo cardInfo;

        try {
            cardInfo = new CardInfo(
                    map.getString(CARD_NUMBER),
                    map.getInt(CARD_PIN)
            );
            Set<String> cards = getPreferences().getStringSet("libraryCards", new HashSet<String>());
            cards.add(cardInfo.getCardNumber() + "/" + Integer.toString(cardInfo.getCardPin()));

            getPreferences().edit().putStringSet("libraryCards", cards).commit();

            promise.resolve(true);

        } catch (IllegalArgumentException e) {
            promise.reject("Card number invalid", e);
        }

    }

    @ReactMethod void removeCard(ReadableMap map, final Promise promise) {

        CardInfo cardInfo;
        boolean listChanged = false;

        try {
            cardInfo = new CardInfo(
                    map.getString(CARD_NUMBER),
                    map.getInt(CARD_PIN)
            );
            Set<String> cards = getPreferences().getStringSet("libraryCards", new HashSet<String>());
            String cardStr = cardInfo.getCardNumber() + "/" + Integer.toString(cardInfo.getCardPin());
            Iterator<String> iterator = cards.iterator();
            while(iterator.hasNext()) {
                if (iterator.next().equals(cardStr)) {
                    iterator.remove();
                    listChanged = true;
                }
            }

            if (listChanged) {
                getPreferences().edit().putStringSet("libraryCards", cards).commit();
            }


            promise.resolve(true);

        } catch (IllegalArgumentException e) {
            promise.reject("Card number not found", e);
        }

    }


    @ReactMethod
    public void getCards(final Promise promise) {
        WritableArray cardArray = Arguments.createArray();
        Set<String> cards = getPreferences().getStringSet("libraryCards", new HashSet<String>());
        Iterator<String> iterator = cards.iterator();
        while(iterator.hasNext()) {
          cardArray.pushString(iterator.next());
        }
        promise.resolve(cardArray);
    }

    @ReactMethod
    public void startNfcService(final Promise promise) {
        Log.d("HelsinkiNFC", "Starting service...");
        Intent intent = new Intent(getReactApplicationContext(), HostCardEmulationService.class);
        getReactApplicationContext().startService(intent);
        promise.resolve(true);
    }

    @ReactMethod
    public void stopNfcService() {
        Log.d("HelsinkiNFC", "Stopping service...");
        Intent intent = new Intent(getReactApplicationContext(), HostCardEmulationService.class);
        getReactApplicationContext().stopService(intent);
    }

}
