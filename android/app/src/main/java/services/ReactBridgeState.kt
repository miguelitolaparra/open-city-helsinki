package services

import android.util.Log
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule

public interface ChangeListener {
    fun onChange(token: String, nonce: String)
}

object ReactBridgeState {
    var generateJWT: Callback ? = null
    var listener: ChangeListener ? = null
    var context: ReactContext ? = null

    fun setReactContext(context: ReactContext) {
        this.context = context
    }

    fun getReactContext() : ReactContext? {
        return this.context
    }

    fun setChangeListener(listener: ChangeListener) {
        // TODO: locking?
        this.listener = listener
    }

    fun sendEvent(deviceId: String) {
        Log.d("BRIDGE", "sending event")
        this.context?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)?.emit("apdu", deviceId)
    }

    fun notifyListener(token: String, nonce: String) {
        this.listener?.onChange(token, nonce)
    }
    
}
