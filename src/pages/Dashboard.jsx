export default function Dashboard() {

  const user =
    JSON.parse(localStorage.getItem("user"));

  return (
    <div className="container">
      <div className="card">

        <h1>Welcome Back</h1>

        <h2>{user?.name}</h2>

        <div className="verified">
          ✅ Verified Successfully
        </div>

      </div>
    </div>
  );
}