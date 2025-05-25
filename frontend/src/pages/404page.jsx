import DirectoryNavigation from "./components/sections/nav/directoryNav/DirectoryNavigation";


export default function PageNotFound() {
    return <div>
        <DirectoryNavigation />
        <h1>ERROR 404</h1>
        <p>Page does not exist</p>
    </div>
}