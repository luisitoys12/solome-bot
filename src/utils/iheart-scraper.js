const axios = require('axios')

/**
 * Busca estaciones en iHeartRadio sin usar el paquete npm roto
 * Usa la API interna de iHeartRadio directamente
 */
class IHeartRadioScraper {
  constructor() {
    this.baseURL = 'https://us.api.iheart.com/api/v3/search/all'
    this.streamBaseURL = 'https://www.iheart.com/live'
  }

  /**
   * Busca estaciones de radio en iHeartRadio
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Array>} Lista de estaciones encontradas
   */
  async search(query) {
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          keywords: query,
          countryCode: 'US',
          queryStation: true,
          queryArtist: false,
          queryTrack: false,
          queryTalkShow: false,
          queryPodcast: false,
          startIndex: 0,
          maxRows: 10
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000
      })

      if (!response.data || !response.data.results || !response.data.results.stations) {
        return []
      }

      return response.data.results.stations.map(station => ({
        id: station.id,
        name: station.name,
        description: station.description || station.name,
        frequency: station.freq || 'Online',
        city: station.city || 'Unknown',
        state: station.state || '',
        genre: station.genre || 'Various',
        logo: station.logo || station.newlogo || null,
        callLetters: station.callLetters || '',
        score: station.score || 0
      })).sort((a, b) => b.score - a.score)

    } catch (error) {
      console.error('Error buscando en iHeartRadio:', error.message)
      return []
    }
  }

  /**
   * Obtiene la URL del stream de una estación
   * @param {Object} station - Objeto de estación
   * @returns {Promise<string>} URL del stream
   */
  async getStreamURL(station) {
    try {
      // Método 1: Intentar obtener stream directo de la API
      const apiURL = `https://us.api.iheart.com/api/v2/content/liveStations/${station.id}`
      
      const response = await axios.get(apiURL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000
      })

      if (response.data && response.data.hits && response.data.hits.length > 0) {
        const stationData = response.data.hits[0]
        
        // Buscar streams en orden de calidad
        const streams = stationData.streams || {}
        
        // Preferencia: shout_cast > hls_stream > stw_stream
        if (streams.shoutcast_stream) {
          return streams.shoutcast_stream
        }
        if (streams.hls_stream) {
          return streams.hls_stream
        }
        if (streams.stw_stream) {
          return streams.stw_stream
        }
        if (streams.secure_shoutcast_stream) {
          return streams.secure_shoutcast_stream
        }
      }

      // Método 2: Construir URL basada en patrón conocido
      if (station.id) {
        // Formato común: https://cXX.prod.playlists.ihrhls.com/[ID]/playlist.m3u8
        const hls = `https://c13.prod.playlists.ihrhls.com/${station.id}/playlist.m3u8`
        
        // Verificar si existe
        try {
          await axios.head(hls, { timeout: 3000 })
          return hls
        } catch (e) {
          // Intentar con otro servidor
          const hls2 = `https://c10.prod.playlists.ihrhls.com/${station.id}/playlist.m3u8`
          return hls2
        }
      }

      throw new Error('No se pudo obtener URL del stream')

    } catch (error) {
      console.error('Error obteniendo stream de iHeartRadio:', error.message)
      
      // Último intento: URL genérica basada en ID
      if (station.id) {
        return `https://c13.prod.playlists.ihrhls.com/${station.id}/playlist.m3u8`
      }
      
      throw error
    }
  }

  /**
   * Busca y obtiene el stream de una estación en un solo paso
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Object>} Estación con URL de stream
   */
  async searchAndGetStream(query) {
    const stations = await this.search(query)
    
    if (stations.length === 0) {
      throw new Error('No se encontraron estaciones')
    }

    const station = stations[0]
    const streamURL = await this.getStreamURL(station)

    return {
      ...station,
      streamURL
    }
  }
}

module.exports = new IHeartRadioScraper()
