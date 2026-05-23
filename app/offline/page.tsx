"use client"

export default function OfflinePage() {
  return (
    <div style={{
      minHeight:      "100vh",
      background:     "#0f0f11",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      flexDirection:  "column",
      gap:            16,
      fontFamily:     "DM Sans, system-ui, sans-serif",
    }}>
      <div style={{
        width:          64,
        height:         64,
        borderRadius:   16,
        background:     "#1a1a2e",
        border:         "0.5px solid #2a2a4e",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       28,
      }}>
        ⚙
      </div>
      <div style={{
        fontSize:   18,
        fontWeight: 500,
        color:      "#d8d8d8",
      }}>
        Hors ligne
      </div>
      <div style={{
        fontSize:   13,
        color:      "#505058",
        textAlign:  "center",
        maxWidth:   280,
        lineHeight: 1.6,
      }}>
        Vérifiez votre connexion internet et réessayez.
        <br />
        Check your internet connection and try again.
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          background:   "#1e1e30",
          color:        "#8888cc",
          border:       "0.5px solid #2e2e48",
          borderRadius: 8,
          padding:      "10px 24px",
          fontSize:     13,
          cursor:       "pointer",
          fontFamily:   "inherit",
          marginTop:    8,
        }}
      >
        Réessayer / Retry
      </button>
    </div>
  )
}