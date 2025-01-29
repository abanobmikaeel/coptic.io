const CodeExample = ({ data }: any) => {
	return (
		<div className="bg-gray-900 rounded-lg p-4 mt-4">
			<pre className="overflow-x-auto text-sm text-gray-100 text-left">
				{JSON.stringify(data, null, 2)}
			</pre>
		</div>
	)
}

export default CodeExample
