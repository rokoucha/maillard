type Props = Readonly<{
  latitude: number
  longitude: number
  place?: string
  url: string
  zoom: number
}>

export function GoogleMap({
  latitude,
  longitude,
  place,
  url,
  zoom,
}: Props): React.ReactNode {
  return (
    <a href={url} target="_blank">
      {place || `${latitude} ${longitude}`}
    </a>
  )
}
