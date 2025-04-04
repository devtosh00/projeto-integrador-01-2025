var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

//app.MapGet("/", () => "Hello World!");
app.UseStaticFiles(); // Permite servir arquivos HTML, CSS, JS

app.Run();
