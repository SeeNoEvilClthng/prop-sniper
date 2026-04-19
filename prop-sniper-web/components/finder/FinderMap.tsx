"use client";

import { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FinderLead } from "./route";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type Props = {
  leads: FinderLead[];
  selectedLead: FinderLead | null;
  onSelectLead?: (leadId: string) => void;
};

function getMapCenter(leads: FinderLead[]) {
  const valid = leads.filter(
    (lead) =>
      typeof lead.longitude === "number" && typeof lead.latitude === "number"
  );

  if (valid.length === 0) {
    return { lng: -95.3698, lat: 29.7604, zoom: 9 }; // Houston fallback
  }

  if (valid.length === 1) {
    return {
      lng: valid[0].longitude as number,
      lat: valid[0].latitude as number,
      zoom: 11,
    };
  }

  const avgLng =
    valid.reduce((sum, lead) => sum + (lead.longitude as number), 0) / valid.length;
  const avgLat =
    valid.reduce((sum, lead) => sum + (lead.latitude as number), 0) / valid.length;

  return { lng: avgLng, lat: avgLat, zoom: 10 };
}

function scoreColor(score: number) {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#facc15";
  if (score >= 50) return "#fb923c";
  return "#ef4444";
}

export default function FinderMap({
  leads,
  selectedLead,
  onSelectLead,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const center = useMemo(() => getMapCenter(leads), [leads]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      console.error("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
      return;
    }

    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [center.lng, center.lat],
      zoom: center.zoom,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const valid = leads.filter(
      (lead) =>
        typeof lead.longitude === "number" && typeof lead.latitude === "number"
    );

    if (valid.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    valid.forEach((lead) => {
      bounds.extend([lead.longitude as number, lead.latitude as number]);
    });

    map.fitBounds(bounds, {
      padding: 60,
      maxZoom: valid.length === 1 ? 12 : 11,
      duration: 800,
    });
  }, [leads]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const valid = leads.filter(
      (lead) =>
        typeof lead.longitude === "number" && typeof lead.latitude === "number"
    );

    valid.forEach((lead) => {
      const score = Number(lead.score || 0);

      const el = document.createElement("div");
      el.className = "finder-marker";
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.borderRadius = "999px";
      el.style.background = scoreColor(score);
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 0 4px rgba(255,255,255,0.08)";
      el.style.cursor = "pointer";

      const popupHtml = `
        <div style="color:#111; min-width: 180px;">
          <div style="font-weight:700; font-size:14px;">
            ${lead.address || "No address"}
          </div>
          <div style="font-size:12px; color:#555; margin-top:4px;">
            ${[lead.city, lead.state].filter(Boolean).join(", ")}
          </div>
          <div style="margin-top:8px; font-size:12px;">
            <strong>Score:</strong> ${score}
          </div>
          <div style="margin-top:4px; font-size:12px;">
            <strong>Value:</strong> ${
              lead.estimated_value
                ? `$${Number(lead.estimated_value).toLocaleString()}`
                : "—"
            }
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(popupHtml);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lead.longitude as number, lead.latitude as number])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("click", () => {
        onSelectLead?.(lead.id);
      });

      markersRef.current.push(marker);
    });
  }, [leads, onSelectLead]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLead) return;
    if (
      typeof selectedLead.longitude !== "number" ||
      typeof selectedLead.latitude !== "number"
    ) {
      return;
    }

    map.flyTo({
      center: [selectedLead.longitude, selectedLead.latitude],
      zoom: 13,
      duration: 900,
    });
  }, [selectedLead]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Map View</h3>
          <p className="mt-1 text-sm text-white/50">
            Live city leads on the map
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 px-3 py-2 text-sm text-white/75">
          {leads.length} leads
        </div>
      </div>

      <div
        ref={mapContainerRef}
        className="h-[560px] w-full overflow-hidden rounded-3xl border border-white/10"
      />

      {selectedLead && (
        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
          <p className="text-xs uppercase tracking-wide text-cyan-200/70">
            Selected Lead
          </p>
          <p className="mt-2 font-semibold text-white">
            {selectedLead.address || "No address"}
          </p>
          <p className="text-sm text-white/60">
            {[selectedLead.city, selectedLead.state].filter(Boolean).join(", ")}
          </p>
          <p className="mt-2 text-sm text-white/80">
            Score: {selectedLead.score || 0}
          </p>
        </div>
      )}
    </div>
  );
}