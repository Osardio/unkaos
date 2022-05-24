const rest = {}

rest.base_url = 'http://localhost:3001/'

rest.dict = 
{
	read: 'get',
	update: 'put',
	create: 'post',
	delete: 'delete',
	upsert: 'post'
}

rest.headers = 
{
	'content-type': 'application/json'
}

const get_subdomain = function()
{
	let uri = window.location.href
      let uri_parts = uri.split('.')

      if(uri_parts.length == 3) return uri_parts[0].replace('http://', '')
       // console.log('ddd', this.$store.state['domain'])
      
      return 'public'   
}

rest.get_token = async function(email, pass)
{
	rest.headers.subdomain = get_subdomain()
	rest.headers.email = email
	rest.headers.password = pass

	const options = 
	{
		method: 'get',
	    headers: rest.headers
	}

	const resp = await fetch(this.base_url + 'get_token', options)

	if(resp.status != 200) return null

	const data = await resp.json();

	//rest.headers.token = data.user_token
	localStorage.user_token = data.user_token
	localStorage.profile = JSON.stringify(data.profile)

	

	return data
}

rest.run_method = async function(method, body)
{ 
	method = method.replace('create', 'upsert').replace('update', 'upsert')

	rest.headers.token = localStorage.user_token

	rest.headers.subdomain = get_subdomain()

	console.log('hhhh', rest.headers)

	const options = 
	{
		method: rest.dict[method.split('_')[0]],
	    headers: rest.headers
	}

	if(body != undefined) options.body = JSON.stringify(body)

	const resp = await fetch(this.base_url + method, options)

	if(resp.status == 401) window.location.href = '/login';

	console.log('respppppppp', resp)

	const data = await resp.json();

	if(data[1] != undefined) return data[1].rows
	return data.rows
}

export default rest