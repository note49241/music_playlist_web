"use client";
import { useEffect, useState } from "react";

interface Song {
  _id: string;
  title: string;
  artist: string;
  album: string;
}

interface Playlist {
  _id: string;
  name: string;
  songs: Song[];
}

export default function Home() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // เรียก API เพื่อดึงข้อมูลเพลย์ลิสต์ทั้งหมด
  const fetchPlaylists = async () => {
    try {
      const response = await fetch("http://localhost:3001/playlists"); // URL ของ NestJS API
      const data = await response.json();
      setPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Music Playlists 🎵</h1>
      {playlists.length === 0 ? (
        <p>No playlists found.</p>
      ) : (
        playlists.map((playlist) => (
          <div key={playlist._id} style={{ marginBottom: "20px" }}>
            <h2>{playlist.name}</h2>
            <ul>
              {playlist.songs.map((song) => (
                <li key={song._id}>
                  {song.title} - {song.artist} ({song.album})
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
